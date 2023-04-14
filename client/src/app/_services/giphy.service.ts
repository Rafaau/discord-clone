import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { GiphyResult, GifData, SearchReqeust } from '../_models/gif'

import { Subject, Observable } from 'rxjs';
import { distinct } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GiphyService {

  static readonly giphyUrl = 'https://api.giphy.com/v1/gifs/search'
  static readonly giphyApiKey = environment.giphyApiKey

  private readonly rating = 'G'
  private readonly lang = 'en'

  currentOffset = 0
  currentSearchTerm = ''
  pageSize = 20

  imageResult = []

  searchResultsSubject = new Subject<Array<GifData>>()
  searchResults$ = new Observable<Array<GifData>>()

  searchRequest = new Subject<SearchReqeust>()
  resetSearch = new Subject<any>()

  constructor(private http: HttpClient) {
    this.searchResults$ = this.searchResultsSubject.asObservable()

    this.searchRequest.pipe(
      distinct(request => request.offset, this.resetSearch),
    ).subscribe((request) => {
      this.getSearchResults(
        request.searchTerm, 
        request.offset, 
        request.pageSize
    )
    });
  }

  private getSearchResults(
    searchTerm: 
    string, offset: 
    number, pageSize: 
    number
) {
    const params = {
      api_key: GiphyService.giphyApiKey,
      q: searchTerm,
      limit: pageSize.toString(),
      offset: offset.toString(),
      rating: this.rating,
      lang: this.lang
    }

    this.http.get<GiphyResult>(GiphyService.giphyUrl, { params, headers: { 'No-Intercept': 'true' } })
        .subscribe((giphyResult) => {
            this.imageResult = this.imageResult.concat((giphyResult as any).data)
            this.currentOffset = giphyResult.pagination.offset + giphyResult.pagination.count

            this.searchResultsSubject.next(this.imageResult)
        })
  }

  search(searchTerm: string) {
    this.currentSearchTerm = searchTerm
    this.currentOffset = 0

    this.imageResult = []
    this.searchResultsSubject.next(this.imageResult)

    this.resetSearch.next(null)

    this.searchRequest.next({ 
        searchTerm: this.currentSearchTerm, 
        offset: this.currentOffset, 
        pageSize: this.pageSize 
    })
  }

  next() {
    this.searchRequest.next({ 
        searchTerm: this.currentSearchTerm, 
        offset: this.currentOffset, 
        pageSize: this.pageSize 
    })
  }

  setPageSize(size: number) {
    this.pageSize = size
  }
}
