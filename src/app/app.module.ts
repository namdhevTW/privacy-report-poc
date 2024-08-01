import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TracingComponent } from './tracing/tracing.component';
import { PiaComponent } from './pia/pia.component';
import { OnboardingComponent } from './onboarding/onboarding.component';
import { ReportingComponent } from './reporting/reporting.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardModule } from './dashboard/dashboard.module';

@NgModule({
  declarations: [
    AppComponent,
    TracingComponent,
    PiaComponent,
    OnboardingComponent,
    ReportingComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    DashboardModule,
    MatSelectModule,
    MatTabsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
