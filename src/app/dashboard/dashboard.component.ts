import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'dashboard' },
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class Dashboard {
  readonly stats = [
    { label: 'Total Users', value: '25' },
    { label: 'Active', value: '19' },
    { label: 'Editors', value: '8' },
    { label: 'Admins', value: '5' },
  ];
}
