import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoldPipe } from './gold/gold.pipe';
import { CraftRecipePipe } from './craft-recipe/craft-recipe.pipe';
import { GoldComponent } from './gold/gold.component';



@NgModule({
  declarations: [
    GoldPipe,
    CraftRecipePipe,
    GoldComponent
  ],
  exports: [
    GoldPipe,
    CraftRecipePipe,
    GoldComponent
  ],
  imports: [
    CommonModule
  ]
})
export class SharedModule { }
