import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-end-call-dialog',
  templateUrl: './end-call-dialog.component.html',
  styleUrls: ['./end-call-dialog.component.css']
})
export class EndCallDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<EndCallDialogComponent>) { }

  ngOnInit(): void {
  }

  onNoClick() {
    this.dialogRef.close();
  }

  onYesClick() {
    this.dialogRef.close({event: true});
  }
}
