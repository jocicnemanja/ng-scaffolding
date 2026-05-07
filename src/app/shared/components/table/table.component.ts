import {
  Component,
  ChangeDetectionStrategy,
  contentChild,
  TemplateRef,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Pagination } from '../pagination/pagination.component';
import { GridStore } from '../../grid-store/grid.store';

@Component({
  selector: 'kim-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'table-wrapper',
    '[class.__fullscreen]': 'isFullScreen',
  },
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  imports: [NgTemplateOutlet, Pagination],
})
export class Table {

  store = input.required<GridStore<any>>();


  headerRef = contentChild<TemplateRef<any>>('header');
  headerColumnsRef = contentChild<TemplateRef<any>>('headerColumns');
  rowRef = contentChild<TemplateRef<any>>('row');
  filtersRef = contentChild<TemplateRef<any>>('filters');
  footerRef = contentChild<TemplateRef<any>>('footer');
  footerColumnsRef = contentChild<TemplateRef<any>>('footerColumns');
  noItemsRef = contentChild<TemplateRef<any>>('noItems');

  configuration = input({
    canExport: false,
    canFullscreen: false,
    showRefresh: false,
    bordered: false,
    borderedCells: false,
    borderedHeaders: false,
    borderedVertical: false,
    striped: false,
    colored: true,
    noItemsTitle: 'No items found',
    noItemsMessage: '',
  });

  isFullScreen = false;

  toggleFullScreen() {
    this.isFullScreen = !this.isFullScreen;
  }

  trackByFn(index: number, item: any): any {
    return item?.id ?? index;
  }

  downloadCsv() {
    throw new Error('Not implemented');
  }
}
