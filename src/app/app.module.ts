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
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { EndCallDialogComponent } from './end-call-dialog/end-call-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    JoinPageComponent,
    TwilioConferenceComponent,
    TwilioChatComponent,
    PageNotFoundComponent,
    DashboardComponent,
    EndCallDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule
  ],
  exports: [MatDialogModule, MatButtonModule],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [
    EndCallDialogComponent
  ]
})
export class AppModule { }
