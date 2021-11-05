import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TwilioVideoService } from './services/twilio-video.service';
import { HttpClientModule } from '@angular/common/http';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [TwilioVideoService]
})
export class CoreModule { }
