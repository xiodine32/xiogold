import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoldPipe } from './gold/gold.pipe';
import { CraftRecipePipe } from './craft-recipe/craft-recipe.pipe';
import { GoldComponent } from './gold/gold.component';
import { ItemNamePipe } from './item-name/item-name.pipe';



@NgModule({
  declarations: [
    GoldPipe,
    CraftRecipePipe,
    GoldComponent,
    ItemNamePipe
  ],
  exports: [
    GoldPipe,
    CraftRecipePipe,
    GoldComponent,
    ItemNamePipe
  ],
  imports: [
    CommonModule
  ]
})
export class SharedModule { }
