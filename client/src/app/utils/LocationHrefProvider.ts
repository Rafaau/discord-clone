import { Location } from "@angular/common";
import { OnInit } from "@angular/core";

export class LocationHrefProvider {
    route: string = ''

    constructor(
        private location: Location
    ) { 
        this.getHref() // initial
        location.onUrlChange(() => {
            this.getHref() // on every url change
        })
    }

    getHref() {
        const href = window.location.href
        this.route = href.slice(href.lastIndexOf('/'))       
    }

    getParamValue(param: string) {
    }
}