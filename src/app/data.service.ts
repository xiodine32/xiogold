import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import recipes from './data/recipes';
import vendors from './data/vendors';
import { Craft, Item, ItemId, Vendor } from './item.class';

export interface CraftItemDelta {
  item: Item;
  craft: Craft;
  itemBuyout: number;
  craftWithCut: number;
  delta: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  snapshotProfits$: Observable<Map<ItemId, CraftItemDelta>>;

  constructor(private matSnackBar: MatSnackBar) {
    this.snapshotProfits$ = this.snapshotProfits();
  }

  private _craft$ = new BehaviorSubject<Map<ItemId, Craft>>(new Map<ItemId, Craft>());

  get craft$() { return this._craft$.asObservable(); }

  private _vendor$ = new BehaviorSubject<Map<ItemId, Vendor>>(new Map<ItemId, Vendor>());

  get vendor$() { return this._vendor$.asObservable(); }

  private _stock$ = new BehaviorSubject<Map<ItemId, Item>>(new Map<ItemId, Item>());

  get stock$() { return this._stock$.asObservable(); }

  get hasStock() { return this._stock$.value.size !== 0; }

  import(value: string) {
    this.importVendor();
    this.importStock(value);
    this.importRecipes();
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
        const message = 'There are ' + unknownEntries.length + ' unknown entries, look at console log!';
        this.matSnackBar.open(message, 'Ok', { duration: 2000 });
      }
    }
    this._craft$.next(recipesMap);
  }

  private snapshotProfits() {
    return combineLatest([this.stock$, this.craft$]).pipe(
      map(([stock, craft]) => {
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
          profitMap.set(intersection, {
            craft: craftedItem,
            item: ahItem,
            craftWithCut: craftNoCut * 0.95,
            itemBuyout: itemBuyout,
            delta: itemBuyout - (craftNoCut * 0.95)
          });
        }
        return profitMap;
      }),
      shareReplay(1)
    )
  }
}

