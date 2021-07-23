import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-sell-rate',
  templateUrl: './sell-rate.component.html',
  styleUrls: ['./sell-rate.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SellRateComponent implements OnInit {

  @Input() sellRate!: string;

  constructor() { }

  ngOnInit(): void {
  }

}
