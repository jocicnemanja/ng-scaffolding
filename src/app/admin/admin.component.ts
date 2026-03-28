import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'kim-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  host: { 'class': 'admin' },
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class Admin {}
