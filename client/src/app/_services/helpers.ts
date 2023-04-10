import { HttpHeaders } from "@angular/common/http"

export class ApiHelpers {
    static readonly headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.NG_APP_CORS_ORIGIN || 'http://localhost:4200',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': '*',
        'Accept': 'application/json',
        'key': 'x-api-key',
        'Connection': 'keep-alive',
        'value': 'NNctr6Tjrw9794gFXf3fi6zWBZ78j6Gv3UCb3y0x',
      })
}