import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import ignoredItems from './data/ignoredItems';
import recipes from './data/recipes';
import sellPrices from './data/sellPrices';
import vendors from './data/vendors';
import { Craft, Item, ItemId, Vendor } from './item.class';

export interface CraftItemDelta {
  item: Item;
  craft: Craft;
  itemBuyout: number;
  craftWithCut: number;
  delta: number;
}

export interface CraftProfit {
  quantity: number;
  totalCost: number;
  totalPost: number;
  regents: Map<ItemId, { quantity: number, totalCost: number }>;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  snapshotProfits$: Observable<Map<ItemId, CraftItemDelta>>;
  profits$: Observable<Map<ItemId, CraftProfit>>;
  private _profitsQuery$ = new ReplaySubject<{ gold: number; maxQuantity: number }>(1);

  constructor() {
    this.snapshotProfits$ = this.snapshotProfits();
    this.profits$ = this.calculateProfits();
  }

  private _craft$ = new BehaviorSubject<Map<ItemId, Craft>>(new Map<ItemId, Craft>());

  get craft$() { return this._craft$.asObservable(); }

  private _vendor$ = new BehaviorSubject<Map<ItemId, Vendor>>(new Map<ItemId, Vendor>());

  get vendor$() { return this._vendor$.asObservable(); }

  private _stock$ = new BehaviorSubject<Map<ItemId, Item>>(new Map<ItemId, Item>());

  get stock$() { return this._stock$.asObservable(); }

  get hasStock() { return this._stock$.value.size !== 0; }

  private static calculateProfitMap(stock: Map<ItemId, Item>, craft: Map<ItemId, Craft>) {
    const sellPriceMap: { [id: string]: number } = sellPrices;
    const profitMap = new Map<ItemId, CraftItemDelta>();
    const stockIds = new Set([...stock.keys()]);
    const craftIds = new Set([...craft.keys()]);
    const intersections = new Set<number>();
    for (const craftId of craftIds.values()) {
      if (stockIds.has(craftId)) {
        intersections.add(craftId);
      }
    }
    for (const intersection of intersections.values()) {
      const ahItem = stock.get(intersection) as Item;
      const craftedItem = craft.get(intersection) as Craft;
      const itemBuyout = ahItem.peek(1);
      const craftNoCut = craftedItem.peek(1);
      if (itemBuyout === null || craftNoCut === null) { continue; }
      const craftWithCut = craftNoCut * 1.05 + (sellPriceMap[`${ahItem.id}`] || 0) * 0.3;
      profitMap.set(intersection, {
        craft: craftedItem,
        item: ahItem,
        craftWithCut: craftWithCut,
        itemBuyout: itemBuyout,
        delta: itemBuyout - craftWithCut
      });
    }
    return profitMap;
  }

  import(value: string) {
    this.importVendor();
    this.importStock(value);
    this.importRecipes();
  }

  getProfits(gold: number, maxQuantity: number) {
    this._profitsQuery$.next({ gold: gold * 10000, maxQuantity });
  }

  private importStock(value: string) {
    const stockMap = new Map<ItemId, Item>();
    const split = value
      .split('\n')
      .map(a => a.split(',')
        .map(b => b.replace(/\|$/, '').split('|')
          .map(c => c.split('&')
            .map(d => +d)
          )
        )
      );
    for (const [[[itemId]], stock] of split) {
      // skip adding to stock what vendor already has.
      if (this._vendor$.value.has(itemId)) {
        continue;
      }
      const item = new Item(itemId);
      for (const [quantity, buyPrice] of stock) {
        item.add(buyPrice, quantity);
      }
      stockMap.set(itemId, item);
    }
    this._stock$.next(stockMap);
  }

  private importVendor() {
    const vendorMap = new Map<ItemId, Vendor>();
    for (const [itemIdString, buyoutPrice] of Object.entries(vendors)) {
      vendorMap.set(+itemIdString, new Vendor(+itemIdString, buyoutPrice));
    }
    this._vendor$.next(vendorMap);
  }

  private importRecipes() {
    const stockMap = this._stock$.value;
    const vendorMap = this._vendor$.value;
    const recipesMap = new Map<ItemId, Craft>();
    let entries = Object.entries(recipes);
    let unknownEntries: [string, { [item: string]: number }][] = [];
    const doImport = (entries: [string, { [item: string]: number }][]) => {
      for (const [itemIdString, craftingDict] of entries) {
        const itemId = +itemIdString;
        const crafts: { quantity: number, item: Item | Vendor | Craft }[] = [];
        for (const [craftItemIdString, quantity] of Object.entries(craftingDict)) {
          const item = vendorMap.get(+craftItemIdString) ?? stockMap.get(+craftItemIdString) ?? recipesMap.get(+craftItemIdString);
          if (item === undefined) {
            unknownEntries.push([itemIdString, craftingDict]);
          } else {
            crafts.push({ quantity, item });
          }
        }
        if (crafts.length === Object.entries(craftingDict).length) {
          const craft = new Craft(itemId, ...crafts);
          recipesMap.set(itemId, craft);
        }
      }
    };
    doImport(entries);
    const retryEntries = [...unknownEntries];
    unknownEntries = [];
    if (retryEntries.length) {
      doImport(retryEntries);
      if (unknownEntries.length) {
        console.warn('unknownEntries', unknownEntries);
      }
    }
    this._craft$.next(recipesMap);
  }

  private snapshotProfits() {
    return combineLatest([this.stock$, this.craft$]).pipe(
      map(([stock, craft]) => DataService.calculateProfitMap(stock, craft)),
      shareReplay(1)
    )
  }

  private calculateProfits() {
    return combineLatest([this.stock$, this.craft$, this._profitsQuery$]).pipe(
      map(([stock, craft, { gold: goldCalc, maxQuantity }]) => {
        const newProfitMap = new Map<ItemId, CraftProfit>();
        const ignoredItemsArray = ignoredItems;
        // calculate best match
        const newStock = new Map<ItemId, Item>();
        for (const [key, value] of stock.entries()) {
          newStock.set(key, value.duplicate());
        }
        const newCraft = new Map<ItemId, Craft>();
        for (const [key, value] of craft.entries()) {
          newCraft.set(key, value.duplicate(newStock, this._vendor$.value));
        }
        let originalGold = goldCalc + 1;
        while (originalGold > goldCalc) {
          originalGold = goldCalc;
          const profits = [...DataService.calculateProfitMap(newStock, newCraft).values()];
          profits.sort((a, b) => b.delta - a.delta);
          const shouldRemoveId = (itemId: number) => {
            if (profits.length === 0 || profits[0].delta <= 0) { return false; }
            if (ignoredItemsArray.includes(itemId)) { return true; }
            return newProfitMap.has(itemId)
              ? (newProfitMap.get(itemId) as CraftProfit).quantity >= maxQuantity
              : false;
          };
          while (shouldRemoveId(profits[0].item.id)) {
            profits.shift();
          }
          const itemId = profits[0].item.id;
          if (profits.length > 0 && profits[0].delta > 0 && goldCalc > profits[0].craftWithCut) {
            goldCalc -= profits[0].craftWithCut;
            if (!newProfitMap.has(itemId)) {
              const regents = new Map<ItemId, { quantity: number, totalCost: number }>();
              profits[0].craft.crafting.forEach(crafting => regents.set(crafting.item.id, {
                quantity: crafting.quantity,
                totalCost: crafting.item.peek(crafting.quantity) as number
              }));
              newProfitMap.set(itemId, { quantity: 1, totalCost: profits[0].craftWithCut, totalPost: profits[0].itemBuyout, regents })
            } else {
              const oldQ = newProfitMap.get(itemId) as CraftProfit;
              oldQ.quantity++;
              oldQ.totalCost += profits[0].craftWithCut;
              oldQ.totalPost += profits[0].itemBuyout;
              profits[0].craft.crafting.forEach(crafting => {
                if (!oldQ.regents.has(crafting.item.id)) {
                  oldQ.regents.set(crafting.item.id, { totalCost: 0, quantity: 0 });
                }
                const originalRegent = oldQ.regents.get(crafting.item.id) as { quantity: number, totalCost: number };
                oldQ.regents.set(crafting.item.id, {
                  quantity: originalRegent.quantity + crafting.quantity,
                  totalCost: originalRegent.totalCost + (crafting.item.peek(crafting.quantity) as number),
                });
              });
            }
            profits[0].craft.remove(1);
          }
        }
        return newProfitMap;
      })
    );
  }

}

