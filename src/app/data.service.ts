import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Item, ItemId } from './item.class';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  private _stock$ = new BehaviorSubject<Map<ItemId, Item>>(new Map<ItemId, Item>());

  get stock$() { return this._stock$.asObservable(); }

  get hasStock() { return this._stock$.value.size !== 0; }

  import(value: string) {
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
      const item = new Item(itemId);
      for (const [quantity, buyPrice] of stock) {
        item.add(buyPrice, quantity);
      }
      stockMap.set(itemId, item);
    }
    this._stock$.next(stockMap);
  }
}

