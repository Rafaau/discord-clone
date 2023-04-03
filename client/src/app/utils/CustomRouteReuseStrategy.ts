import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private routeHandles: { [key: string]: DetachedRouteHandle } = {};

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return true;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    this.routeHandles[route.routeConfig!.path!] = handle;
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return !!this.routeHandles[route.routeConfig!.path!];
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return this.routeHandles[route.routeConfig!.path!];
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }
}

