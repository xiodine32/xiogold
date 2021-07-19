import { Pipe, PipeTransform } from '@angular/core';
import { mapIdToName } from '../../mappers';

@Pipe({
  name: 'itemName'
})
export class ItemNamePipe implements PipeTransform {

  transform(value: number): string {
    return mapIdToName(value);
  }

}
