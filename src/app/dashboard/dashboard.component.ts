import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(public router: Router) { }

  roomName:any;
  ngOnInit(): void {
  }

  submitRoomName(name:any) {
    this.router.navigate(['join-form'], {
      state: name
    });
  }
}
