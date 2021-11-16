import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CalendarEventService {

  constructor(public http: HttpClient) { }

  calendarEvent(data: any) {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(environment.url + '/CalendarEventParticipants/Activity', JSON.stringify(data), { headers: headers });
  }
}
