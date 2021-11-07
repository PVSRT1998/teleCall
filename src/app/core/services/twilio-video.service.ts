import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TwilioVideoService {

  constructor(public http: HttpClient) { }


  getAccessToken(routerParams?: Params) {
    let queryParams: Params = {};
    if (routerParams) {
      queryParams = this.setParameter(routerParams);
    };
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    return this.http.get(environment.url + '/token', { headers: headers, params: queryParams });
  }

  private setParameter(routerParams: Params): HttpParams {
    let queryParams = new HttpParams();
    for (const key in routerParams) {
      console.log(key);
      if (routerParams.hasOwnProperty(key)) {
        queryParams = queryParams.set(key, routerParams[key]);
      }
    }
    return queryParams;
  }
}
