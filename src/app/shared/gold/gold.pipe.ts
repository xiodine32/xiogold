import { formatNumber } from '@angular/common';
import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gold'
})
export class GoldPipe implements PipeTransform {

  constructor(@Inject(LOCALE_ID) private locale: string) {}

  transform(value: number | null): string {
    if (value === null) { return 'N/A'; }
    const copper = value % 100;
    value = Math.floor(value / 100);
    const silver = value % 100;
    value = Math.floor(value / 100);
    const gold = value;
    const goldString = formatNumber(gold, this.locale, '2.0-0');
    const silverString = formatNumber(silver, this.locale, '2.0-0');
    const copperString = formatNumber(copper, this.locale, '2.0-0');
    return `${goldString}g ${silverString}s ${copperString}c`;
  }

}
