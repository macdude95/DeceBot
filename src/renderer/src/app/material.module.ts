import { NgModule } from '@angular/core';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

const materialComponenets = [
  MatButtonModule,
  MatSlideToggleModule,
  MatCardModule,
];

@NgModule({
  imports: materialComponenets,
  exports: materialComponenets,
})
export class MaterialModule {}
