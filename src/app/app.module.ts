import { NgModule } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { TracingComponent } from './tracing/tracing.component';
import { PiaComponent } from './modules/pia/pia.component';
import { OnboardingComponent } from './modules/onboarding/onboarding.component';
import { ReportingComponent } from './modules/reporting/reporting.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@NgModule({
  declarations: [
    AppComponent,
    TracingComponent,
    PiaComponent,
    OnboardingComponent,
    ReportingComponent
  ],
  bootstrap: [AppComponent], imports: [
    BrowserModule,
    BrowserAnimationsModule,
    DashboardModule,
    MatSelectModule,
    MatTabsModule], providers: [provideHttpClient(withInterceptorsFromDi())]
})
export class AppModule { }
