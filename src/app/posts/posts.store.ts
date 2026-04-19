import { inject, InjectionToken } from "@angular/core";
import { GridStore } from "../shared/grid-store/grid.store";
import { Post } from "./posts.models";
import { PostsDataSource } from "./posts.datasource";

class PostsStore extends GridStore<Post, any> {
    constructor() {
        super(inject(PostsDataSource));
    }
}


export const POSTS_STORE = new InjectionToken<GridStore<Post, any>>('POSTS_STORE');
export const POSTS_STORE_FACTORY = {
    provide: POSTS_STORE,
    useClass: PostsStore,
};