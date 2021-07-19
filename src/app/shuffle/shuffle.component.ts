import { KeyValue } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, TrackByFunction } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CraftProfit, DataService } from '../data.service';
import { ItemId } from '../item.class';

@Component({
  selector: 'app-shuffle',
  templateUrl: './shuffle.component.html',
  styleUrls: ['./shuffle.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShuffleComponent implements OnInit {

  profits$: Observable<Map<ItemId, CraftProfit>>;
  totalCost = 0;
  totalProfit = 0;
  regents = new Map<ItemId, { quantity: number, totalCost: number }>();

  constructor(private dataService: DataService) {
    this.profits$ = this.dataService.profits$.pipe(
      tap(profits => {
        this.totalCost = [...profits.values()].reduce((prev, cur) => prev + cur.totalCost, 0);
        this.totalProfit = [...profits.values()].reduce((prev, cur) => prev + cur.totalPost, 0);
        this.regents = new Map<ItemId, { quantity: number, totalCost: number }>();
        profits.forEach(profit => {
          for (const [itemId, { quantity, totalCost }] of profit.regents.entries()) {
            if (!this.regents.has(itemId)) {
              this.regents.set(itemId, { quantity: 0, totalCost: 0 });
            }
            this.regents.set(itemId, {
              quantity: this.regents.get(itemId)?.quantity as number + quantity,
              totalCost: this.regents.get(itemId)?.totalCost as number + totalCost,
            });
          }
        });
      })
    );
  }

  trackByProfitsId: TrackByFunction<KeyValue<number, CraftProfit>> = index => `${index}`;
  trackByRegentId: TrackByFunction<KeyValue<number, { quantity: number, totalCost: number }>> = index => `${index}`;

  ngOnInit(): void {
  }

  onQueryChange({ gold, maxQuantity }: { gold: number, maxQuantity: number }): void {
    this.dataService.getProfits(gold, maxQuantity);
  }
}
