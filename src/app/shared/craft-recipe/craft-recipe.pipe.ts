import { Pipe, PipeTransform } from '@angular/core';
import { Craft } from '../../item.class';

@Pipe({
  name: 'craftRecipe'
})
export class CraftRecipePipe implements PipeTransform {

  transform(value: Craft): string {
    return value.crafting.map(a => `${a.quantity}x ${a.item.name()}`).join(' ');
  }

}
