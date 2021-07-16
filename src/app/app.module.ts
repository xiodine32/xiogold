import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatLineModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { EditComponent } from './edit/edit.component';
import { NavigationComponent } from './navigation/navigation.component';
import { SharedModule } from './shared/shared.module';
import { ShuffleComponent } from './shuffle/shuffle.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { SortedByDeltaPipe } from './statistics/sorted-by-delta.pipe';

@NgModule({
  declarations: [
    AppComponent,
    EditComponent,
    NavigationComponent,
    StatisticsComponent,
    ShuffleComponent,
    SortedByDeltaPipe
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTabsModule,
    MatListModule,
    MatLineModule,
    SharedModule,
    MatTooltipModule,
    MatSnackBarModule
    // AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
