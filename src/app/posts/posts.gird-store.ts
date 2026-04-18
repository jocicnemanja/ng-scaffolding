import { InjectionToken } from "@angular/core";
import { GridStore } from "../shared/grid-store/grid.store";
import { Post } from "./posts.models";
import { PostsDataSource } from "./posts.data-source";

export const POSTS_STORE = new InjectionToken<GridStore<Post, any>>('POSTS_STORE');

export const POSTS_STORE_FACTORY = {
    provide: POSTS_STORE,
    useFactory: (dataSource: PostsDataSource) => new GridStore<Post, any>(dataSource),
    deps: [PostsDataSource],
}