import { Pipe, PipeTransform } from '@angular/core';
import sellRate from '../../data/sellRate';

@Pipe({
  name: 'sellRate'
})
export class SellRatePipe implements PipeTransform {

  sellRate: { [key: string]: number } = sellRate;

  transform(value: number): string {
    if (this.sellRate[`${value}`]) {
      return `${this.sellRate[`${value}`]}`;
    }
    return 'N/A';
  }

}
