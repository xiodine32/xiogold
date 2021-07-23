import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoldPipe } from './gold/gold.pipe';
import { CraftRecipePipe } from './craft-recipe/craft-recipe.pipe';
import { GoldComponent } from './gold/gold.component';
import { ItemNamePipe } from './item-name/item-name.pipe';
import { SellRatePipe } from './sell-rate/sell-rate.pipe';



@NgModule({
  declarations: [
    GoldPipe,
    CraftRecipePipe,
    GoldComponent,
    ItemNamePipe,
    SellRatePipe
  ],
  exports: [
    GoldPipe,
    CraftRecipePipe,
    GoldComponent,
    ItemNamePipe,
    SellRatePipe
  ],
  imports: [
    CommonModule
  ]
})
export class SharedModule { }
