import { Component, inject } from '@angular/core';
import { SdkTable } from 'ui-sdk';
import { POSTS_STORE, POSTS_STORE_FACTORY } from './posts.store';

@Component({
  selector: 'kim-posts',
  imports: [SdkTable],
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
