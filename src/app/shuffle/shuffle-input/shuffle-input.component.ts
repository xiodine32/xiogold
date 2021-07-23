import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProfitQuery } from '../../data.service';

@Component({
  selector: 'app-shuffle-input',
  templateUrl: './shuffle-input.component.html',
  styleUrls: ['./shuffle-input.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShuffleInputComponent implements OnInit {

  fg = new FormGroup({
    gold: new FormControl(2000, [Validators.required, Validators.min(1000), Validators.pattern(/^\d+$/)]),
    maxQuantity: new FormControl(20, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]),
    minSaleRate: new FormControl(15, [Validators.required, Validators.min(1), Validators.pattern(/^\d{1,3}$/)])
  })

  @Output() queryChange = new EventEmitter<ProfitQuery>();


  constructor() { }

  ngOnInit(): void {
  }

  onCalculate() {
    const value = {...this.fg.value} as ProfitQuery;
    // gold input to currency
    value.gold *= 10000;
    value.minSaleRate /= 100;
    this.queryChange.emit(value);
  }
}
