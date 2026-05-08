import {
  Component,
  ChangeDetectionStrategy,
  computed,
  contentChild,
  signal,
  TemplateRef,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { SdkPagination } from '../pagination/pagination';
import { GridStore } from '../store/grid.store';
import { SdkConfirmDialog, SdkConfirmKind } from '../../components/confirm-dialog/confirm-dialog';
import { SdkDrawer } from '../../components/drawer/drawer';
import { PaginationState } from '../gird.models';

export type SdkTableFormMode = 'create' | 'edit';

export interface SdkTableConfirmCopy {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  kind: SdkConfirmKind;
}

export interface SdkTableConfirmConfig {
  create: SdkTableConfirmCopy;
  update: SdkTableConfirmCopy;
  delete: SdkTableConfirmCopy;
}

export interface SdkTableDrawerConfig {
  createTitle: string;
  editTitle: string;
}

const DEFAULT_CONFIRM_CONFIG: SdkTableConfirmConfig = {
  create: {
    title: 'Create item',
    message: 'Are you sure you want to create this item?',
    confirmLabel: 'Create',
    cancelLabel: 'Cancel',
    kind: 'info',
  },
  update: {
    title: 'Save changes',
    message: 'Are you sure you want to save these changes?',
    confirmLabel: 'Save',
    cancelLabel: 'Cancel',
    kind: 'info',
  },
  delete: {
    title: 'Delete item',
    message: 'Are you sure you want to delete this item? This cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    kind: 'danger',
  },
};

const DEFAULT_DRAWER_CONFIG: SdkTableDrawerConfig = {
  createTitle: 'Create item',
  editTitle: 'Edit item',
};

@Component({
  selector: 'sdk-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'table-wrapper',
    '[class.__fullscreen]': 'isFullScreen',
  },
  templateUrl: './table.html',
  styleUrl: './table.css',
  imports: [NgTemplateOutlet, SdkPagination, SdkConfirmDialog, SdkDrawer],
})
export class SdkTable {

  store = input.required<GridStore<any>>();


  headerRef = contentChild<TemplateRef<any>>('header');
  headerColumnsRef = contentChild<TemplateRef<any>>('headerColumns');
  rowRef = contentChild<TemplateRef<any>>('row');
  filtersRef = contentChild<TemplateRef<any>>('filters');
  footerRef = contentChild<TemplateRef<any>>('footer');
  footerColumnsRef = contentChild<TemplateRef<any>>('footerColumns');
  noItemsRef = contentChild<TemplateRef<any>>('noItems');
  formRef = contentChild<TemplateRef<any>>('form');

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

  confirmConfig = input<SdkTableConfirmConfig>(DEFAULT_CONFIRM_CONFIG);
  drawerConfig = input<SdkTableDrawerConfig>(DEFAULT_DRAWER_CONFIG);

  // ─── Form drawer view state (UI-only) ─────────────────────────────────────
  private readonly _formMode = signal<SdkTableFormMode | null>(null);
  private readonly _formEntity = signal<any>(null);
  readonly formMode = this._formMode.asReadonly();
  readonly formEntity = this._formEntity.asReadonly();
  readonly isFormOpen = computed(() => this._formMode() !== null);

  pendingConfirmCopy = computed<SdkTableConfirmCopy | null>(() => {
    const pending = this.store().pendingConfirmation();
    if (!pending) {
      return null;
    }
    return this.confirmConfig()[pending.kind];
  });

  drawerTitle = computed<string>(() => {
    const mode = this._formMode();
    const cfg = this.drawerConfig();
    return mode === 'edit' ? cfg.editTitle : cfg.createTitle;
  });

  // Stable, bound handlers passed into row/header/form templates.
  readonly headerContext = {
    onAdd: () => this.openCreate(),
  };
  readonly rowHandlers = {
    onEdit: (entity: any) => this.openEdit(entity),
    onDelete: (id: string | number) => this.store().delete(id),
  };
  readonly formHandlers = {
    onSave: (payload: any) => this.submitForm(payload),
    onCancel: () => this.closeForm(),
  };

  isFullScreen = false;

  toggleFullScreen() {
    this.isFullScreen = !this.isFullScreen;
  }

  trackByFn(index: number, item: any): any {
    return item?.id ?? index;
  }

  rowContext(row: any, index: number) {
    return {
      $implicit: row,
      idx: index,
      onEdit: this.rowHandlers.onEdit,
      onDelete: this.rowHandlers.onDelete,
    };
  }

  formContext() {
    const mode = this._formMode();
    const entity = this._formEntity();
    return {
      $implicit: entity,
      entity,
      mode,
      isEdit: mode === 'edit',
      onSave: this.formHandlers.onSave,
      onCancel: this.formHandlers.onCancel,
    };
  }

  // ─── Drawer open/close (view-state) ───────────────────────────────────────
  openCreate(): void {
    this._formEntity.set(null);
    this._formMode.set('create');
  }

  openEdit(entity: any): void {
    this._formEntity.set(entity);
    this._formMode.set('edit');
  }

  closeForm(): void {
    this._formMode.set(null);
    this._formEntity.set(null);
  }

  submitForm(payload: any): void {
    const mode = this._formMode();
    if (!mode) {
      return;
    }
    const _store = this.store();
    if (mode === 'create') {
      _store.create(payload);
    } else {
      const current = this._formEntity();
      const merged = { ...(current ?? {}), ...payload, id: current?.id };
      _store.update(merged);
    }
    this.closeForm();
  }

  downloadCsv() {
    throw new Error('Not implemented');
  }

  handlePageChange(paginationState: PaginationState) {
    this.store().setPagination(paginationState);
  }
}
