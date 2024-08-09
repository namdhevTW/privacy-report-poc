import { NgModule } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { TracingComponent } from './tracing/tracing.component';
import { PiaComponent } from './pia/pia.component';
import { OnboardingComponent } from './onboarding/onboarding.component';
import { ReportingComponent } from './reporting/reporting.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgxEchartsModule } from 'ngx-echarts';

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
