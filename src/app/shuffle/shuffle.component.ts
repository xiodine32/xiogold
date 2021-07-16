import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-shuffle',
  templateUrl: './shuffle.component.html',
  styleUrls: ['./shuffle.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShuffleComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
