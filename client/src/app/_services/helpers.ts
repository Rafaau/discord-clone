import { HttpHeaders } from "@angular/common/http"

export class ApiHelpers {
  static headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Accept': 'application/json',
    'Authorization': `Bearer`
  })

  static noInterceptHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Accept': 'application/json',
    'Authorization': `Bearer`,
    'No-Intercept': 'true'
  })

  static updateAuthorizationHeader(token: string) {
    this.headers = this.headers.set('Authorization', `Bearer ${token}`)
    this.noInterceptHeaders = this.noInterceptHeaders.set('Authorization', `Bearer ${token}`)
  }
}
