import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './modal/modal.component';
import { ResultsComponent } from './results/results.component';

@NgModule({
  declarations: [ModalComponent, ResultsComponent],
  imports: [CommonModule],
  exports: [ModalComponent, ResultsComponent]
})
export class SharedModule { }
