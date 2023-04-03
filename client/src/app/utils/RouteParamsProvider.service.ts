import { Injectable } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { BehaviorSubject, Observable, filter, map, switchMap } from "rxjs";

@Injectable({
    providedIn: "root"
})
export class RouteParamsProvider {
    private serverIdSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null)

    constructor(
        private router: Router,
    ) {
        this.serverIdService()
    }

    serverIdService() {
        this.serverIdSubject.next(this.router.routerState.snapshot.root.firstChild?.paramMap.get('serverId')!)
        this.router.events
        .pipe(
          filter((event) => event instanceof NavigationEnd),
          map(() => this.router.routerState.snapshot.root.firstChild)
        )
        .subscribe((firstChild) => {
          if (this.router.url.includes('chatserver')) {
            const serverId = firstChild!.paramMap.get('serverId')
            this.serverIdSubject.next(serverId)
          }
        })
    }

    get serverId$(): Observable<string | null> {
        return this.serverIdSubject.asObservable()
    }
}