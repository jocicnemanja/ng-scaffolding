import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'table-wrapper' },
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class Table {}
