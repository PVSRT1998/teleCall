import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TwilioVideoService } from './services/twilio-video.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule
  ],
  providers: [TwilioVideoService]
})
export class CoreModule { }
