import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  template: `<app-edit></app-edit><app-navigation *ngIf="dataService.hasStock"></app-navigation>`,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(public dataService: DataService) {}
}
