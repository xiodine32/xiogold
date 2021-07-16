import { KeyValue } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, TrackByFunction } from '@angular/core';
import { Observable } from 'rxjs';
import { CraftItemDelta, DataService } from '../data.service';
import { Craft, Item, ItemId, Vendor } from '../item.class';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsComponent implements OnInit {

  stock$: Observable<Map<ItemId, Item>>;
  craft$: Observable<Map<ItemId, Craft>>;
  vendor$: Observable<Map<ItemId, Vendor>>;
  snapshotProfits$: Observable<Map<ItemId, CraftItemDelta>>;

  constructor(private dataService: DataService) {
    this.stock$ = this.dataService.stock$;
    this.craft$ = this.dataService.craft$;
    this.vendor$ = this.dataService.vendor$;
    this.snapshotProfits$ = this.dataService.snapshotProfits$;
  }

  trackByItemId: TrackByFunction<KeyValue<number, Item>> = (index, item) => `${item.key}`;
  trackByCraftId: TrackByFunction<KeyValue<number, Craft>> = (index, item) => `${item.key}`;
  trackByVendorId: TrackByFunction<KeyValue<number, Vendor>> = (index, item) => `${item.key}`;
  trackByCraftItemDeltaId: TrackByFunction<KeyValue<number, CraftItemDelta>> = (index, item) => `${item.key}`;

  ngOnInit(): void {
  }

}
