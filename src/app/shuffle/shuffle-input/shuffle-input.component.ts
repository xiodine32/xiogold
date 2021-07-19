import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-shuffle-input',
  templateUrl: './shuffle-input.component.html',
  styleUrls: ['./shuffle-input.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShuffleInputComponent implements OnInit {

  fg = new FormGroup({
    gold: new FormControl(1000, [Validators.required, Validators.min(1000), Validators.pattern(/^\d+$/)]),
    maxQuantity: new FormControl(20, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)])
  })

  @Output() queryChange = new EventEmitter<{ gold: number; maxQuantity: number; }>();


  constructor() { }

  ngOnInit(): void {
  }

  onCalculate() {
    this.queryChange.emit(this.fg.value);
  }
}
