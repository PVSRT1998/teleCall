import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { JoinPageComponent } from './join-page/join-page.component';
import { TwilioConferenceComponent } from './twilio-conference/twilio-conference.component';
import { HttpClientModule } from '@angular/common/http';
import { TwilioChatComponent } from './twilio-chat/twilio-chat.component';

@NgModule({
  declarations: [
    AppComponent,
    JoinPageComponent,
    TwilioConferenceComponent,
    TwilioChatComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
