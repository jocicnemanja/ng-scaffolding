import { inject, Injectable } from "@angular/core";
import { GridDataSource, PaginationState, QueryState } from "../shared/grid-store/gird.models";
import { map, Observable } from "rxjs";
import { PageResponse } from "../shared/models/page-response.models";
import { Post } from "./posts.models";
import { HttpClient } from "@angular/common/http";
import { buildHttpParams } from "../shared/utils/http-request.utils";




@Injectable({ providedIn: 'root' })
export class PostsDataSource implements GridDataSource<Post, QueryState> {
     httpClient = inject(HttpClient);

    apiUrl = 'https://jsonplaceholder.typicode.com/posts';

    create(entity: Post): Observable<Post> {
        
        throw new Error("Method not implemented.");
    }

    read(query: QueryState, pagination: PaginationState): Observable<PageResponse<Post>> {
         const params = buildHttpParams(query, pagination);
        return this.httpClient.get<Post[]>(this.apiUrl, {
            params
        }).pipe(
            map((data) => ({
                content: data,
                totalElements: data.length,
                totalPages: data.length > 0 ? 1 : 0,
                size: pagination.size,
                number: pagination.page,
                pageable: {
                    sort: {
                        sorted: false,
                        unsorted: true,
                        empty: true,
                    },
                    offset: pagination.page * pagination.size,
                    pageNumber: pagination.page,
                    pageSize: pagination.size,
                    paged: true,
                    unpaged: false,
                },
                last: true,
                first: pagination.page === 0,
                numberOfElements: data.length,
                empty: data.length === 0,
            }))
        );
    }

    update(entity: Post): Observable<Post> {
        throw new Error("Method not implemented.");
    }

    delete(id: string | number): Observable<void> {
        throw new Error("Method not implemented.");
    }

}