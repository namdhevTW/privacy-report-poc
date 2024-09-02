import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AppRoutingModule } from './app-routing.module';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzAffixModule } from 'ng-zorro-antd/affix';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzBackTopModule } from 'ng-zorro-antd/back-top';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { IconDefinition } from '@ant-design/icons-angular';
import { CarryOutOutline, ExportOutline, HomeOutline, MailOutline, MenuFoldOutline, MenuUnfoldOutline, PieChartOutline, ReloadOutline, TableOutline } from '@ant-design/icons-angular/icons';
import { TracingModule } from './modules/tracing/tracing.module';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

registerLocaleData(en);
const icons: IconDefinition[] = [HomeOutline, PieChartOutline, TableOutline, MenuFoldOutline, MenuUnfoldOutline, CarryOutOutline, ExportOutline, ReloadOutline, MailOutline];

@NgModule({
  declarations: [
    AppComponent
  ],
  bootstrap: [AppComponent], imports: [
    BrowserModule,
    BrowserAnimationsModule,
    DashboardModule,
    TracingModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NzAffixModule,
    NzBackTopModule,
    NzLayoutModule,
    NzButtonModule,
    NzToolTipModule,
    NzTabsModule,
    NzIconModule.forRoot(icons),
    NzMenuModule,
    NzSelectModule,
    FormsModule], providers: [provideHttpClient(withInterceptorsFromDi()), { provide: NZ_I18N, useValue: en_US }, provideAnimationsAsync(), provideHttpClient()]
})
export class AppModule { }
