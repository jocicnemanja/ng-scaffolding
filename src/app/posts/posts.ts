import { Component, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { GridStore } from '../shared/grid-store/grid.store';
import { Post } from './posts.models';
import { POSTS_STORE, POSTS_STORE_FACTORY } from './posts.gird-store';

@Component({
  selector: 'kim-posts',
  imports: [JsonPipe],
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
