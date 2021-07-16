import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-gold',
  templateUrl: './gold.component.html',
  styleUrls: ['./gold.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoldComponent implements OnInit, OnChanges {

  isLoss = false;
  displayGold = 0;
  displaySilver = 0;
  displayCopper = 0;
  @Input() gold: null | number = null;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.gold && this.gold !== null) {
      this.displayGold = Math.floor(this.gold / 10000);
      this.displaySilver = Math.abs(Math.floor(this.gold / 100) % 100);
      this.displayCopper = Math.abs(this.gold % 100);
      this.isLoss = this.displayGold < 0;
    }
  }

  ngOnInit(): void {
  }
}
