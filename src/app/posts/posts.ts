import { Component, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { POSTS_STORE, POSTS_STORE_FACTORY } from './posts.store';
import { Table } from '../shared/components/table/table.component';

@Component({
  selector: 'kim-posts',
  imports: [JsonPipe, Table],
  templateUrl: './posts.html',
  styleUrl: './posts.scss',
  providers: [POSTS_STORE_FACTORY],
})
export class Posts {
  protected readonly store = inject(POSTS_STORE);

  constructor() {
    this.store.refresh();
  }
}
