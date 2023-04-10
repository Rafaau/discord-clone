import { HttpHeaders } from "@angular/common/http"

export class ApiHelpers {
  static readonly headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  })
}