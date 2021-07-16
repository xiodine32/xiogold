import { KeyValue } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { CraftItemDelta } from '../data.service';

@Pipe({
  name: 'sortedByDelta'
})
export class SortedByDeltaPipe implements PipeTransform {

  transform(value: KeyValue<number, CraftItemDelta>[], ...args: unknown[]): KeyValue<number, CraftItemDelta>[] {
    const newValue = [...value];
    newValue.sort((a, b) => b.value.delta - a.value.delta);
    return newValue;
  }

}
