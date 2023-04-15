import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CacheResolverService } from "./CacheResolver.service";
import { Observable, of, tap } from "rxjs";

const TIME_TO_LIVE = 60

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
    constructor(
        private cacheResolver: CacheResolverService
    ) { }

    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        if (req.headers.has('No-Intercept')) {
            const modifiedReq = req.clone({
                headers: req.headers.delete('No-Intercept')
            })
            return next.handle(modifiedReq)
        }
        if (req.method !== 'GET')
            return next.handle(req)
        
        const cachedResponse = this.cacheResolver.get(req.urlWithParams)
        
        return cachedResponse ? of(cachedResponse) : this.sendRequest(req, next)
    }

    sendRequest(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            tap(event => {
                if (event instanceof HttpResponse) {
                    this.cacheResolver.set(
                        req.urlWithParams,
                        event
                    )
                }
            })
        )
    }
}