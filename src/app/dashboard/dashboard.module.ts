import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { NgxEchartsModule } from 'ngx-echarts';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  exports: [
    DashboardComponent
  ], imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatNativeDateModule,
    SharedModule,
    NgxEchartsModule.forRoot({
      /**
       * This will import all modules from echarts.
       * If you only need custom modules,
       * please refer to [Custom Build] section.
       */
      echarts: () => import('echarts'), // or import('./path-to-my-custom-echarts')
    }),
    MatFormFieldModule,
    MatDatepickerModule], providers: [provideHttpClient(withInterceptorsFromDi())]
})
export class DashboardModule { }
