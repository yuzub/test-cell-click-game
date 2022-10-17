import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Subject, takeUntil, timer } from 'rxjs';
import { ModalComponent } from './shared/modal/modal.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChildren('cell') cells!: QueryList<ElementRef>;
  @ViewChild('resultModal', { static: false }) modal!: ModalComponent;

  time = new FormControl(100, { validators: [Validators.required, Validators.min(1)] });
  rowCellsNum = 10;
  cellsArr = [...Array(this.rowCellsNum * this.rowCellsNum).keys()];
  playerScore = 0;
  compScore = 0;
  message = '';
  private curIndex = -1;
  private curCellEl!: HTMLDivElement | null;
  private userClick$ = new Subject();
  private usedCells: number[] = [];

  private get isWinner(): boolean {
    return this.compScore === this.rowCellsNum || this.playerScore === this.rowCellsNum
  }

  start(): void {
    this.reset();

    if (this.time.invalid || this.time.value && isNaN(this.time.value)) {
      return;
    }

    this.time.disable();
    this.message = 'Get ready...'
    timer(2000).subscribe((): void => {
      this.message = 'Play!'
      this.runStep();
    });
  }

  private runStep(): void {
    this.curIndex = -1;
    this.curCellEl = null;

    if (this.isWinner) {
      this.time.enable();
      this.message = '';
      this.modal.open();
      return;
    }

    while (true) {
      this.curIndex = this.getRandomInt(Math.pow(this.rowCellsNum, 2));
      if (this.usedCells.indexOf(this.curIndex) === -1) {
        this.usedCells.push(this.curIndex);
        break;
      }
    }

    this.curCellEl = this.cells.get(this.curIndex)?.nativeElement;
    this.setCellColor(this.curCellEl, 'yellow');

    timer(this.time.value || 0)
      .pipe(takeUntil(this.userClick$))
      .subscribe((): void => {
        ++this.compScore;
        this.setCellColor(this.curCellEl, 'red');
        this.runStep();
      });
  }

  private setCellColor(cellEl: HTMLDivElement | null, color: string): void {
    if (cellEl) {
      cellEl.style.backgroundColor = color;
    }
  }

  private getRandomInt(range: number): number {
    return Math.floor(Math.random() * range);
  }

  private reset(): void {
    this.cells.forEach((cell: ElementRef<HTMLDivElement>): void => {
      this.setCellColor(cell.nativeElement, 'blue');
    });
    this.compScore = 0;
    this.playerScore = 0;
    this.curIndex = -1;
    this.curCellEl = null;
    this.usedCells = [];
  }

  gridClick(event: Event): void {
    const clickedEl: HTMLDivElement = event.target as HTMLDivElement;
    if (!clickedEl?.hasAttribute('data-cell-index')) {
      return;
    }

    const clickedCellIndex: number = Number((event.target as HTMLDivElement)?.getAttribute('data-cell-index'));

    if (clickedCellIndex === this.curIndex) {
      ++this.playerScore;
      this.setCellColor(this.curCellEl, 'green');
      this.userClick$.next(true);
      this.runStep();
    }
  }
}
