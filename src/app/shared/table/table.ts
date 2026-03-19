import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'table-wrapper',
  },
  template: `
    <table>
      <thead>
        <tr>
          <ng-content select="[table-header]" />
        </tr>
      </thead>
      <tbody>
        <ng-content select="[table-body]" />
      </tbody>
    </table>
  `,
  styles: `
    :host {
      display: block;
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    :host ::ng-deep thead th {
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      background: #f8fafc;
      border-bottom: 2px solid #e2e8f0;
    }

    :host ::ng-deep tbody td {
      padding: 12px 16px;
      font-size: 0.875rem;
      color: #334155;
      border-bottom: 1px solid #e2e8f0;
    }

    :host ::ng-deep tbody tr:last-child td {
      border-bottom: none;
    }

    :host ::ng-deep tbody tr:hover {
      background: #f1f5f9;
    }
  `,
})
export class Table {}
