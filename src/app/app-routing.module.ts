import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JoinPageComponent } from './join-page/join-page.component';
import { TwilioConferenceComponent } from './twilio-conference/twilio-conference.component';

const routes: Routes = [
  { path: '', component:  JoinPageComponent},
  { path: 'twilio-conference', component: TwilioConferenceComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
