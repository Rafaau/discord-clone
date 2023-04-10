import { HttpHeaders } from "@angular/common/http"

export class ApiHelpers {
  static readonly headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Accept': 'application/json',
  })
}