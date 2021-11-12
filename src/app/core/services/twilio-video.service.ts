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

  isAuthenticate = false;

  getAccessToken(data:any) {

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    
    let accessToken = this.http.post(environment.url + '/TwilioIntegration/GetVideoToken', data,{headers: headers});
    if(accessToken){
      this.isAuthenticate = true;
    } else {
      this.isAuthenticate = false;
    }
    return accessToken;
  }
}
