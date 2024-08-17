import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import { SharedModule } from '@app/shared/shared.module';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { CloseOutline } from '@ant-design/icons-angular/icons';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  exports: [
    DashboardComponent
  ], imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NzSegmentedModule,
    NzEmptyModule,
    NzIconModule.forChild([CloseOutline]),
    NzSelectModule,
    NzDatePickerModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),], providers: [provideHttpClient(withInterceptorsFromDi())]
})
export class DashboardModule { }
