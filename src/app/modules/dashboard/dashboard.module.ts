import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { CloseOutline } from '@ant-design/icons-angular/icons';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { TracingModule } from "@modules/tracing/tracing.module";
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  exports: [
    DashboardComponent
  ],
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzGridModule,
    NzSegmentedModule,
    NzEmptyModule,
    NzModalModule,
    NzIconModule.forChild([CloseOutline]),
    NzSelectModule,
    NzSwitchModule,
    NzToolTipModule,
    NzDatePickerModule,
    NzStatisticModule,
    TracingModule,
    NgxChartsModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    })],
  providers: [provideHttpClient(withInterceptorsFromDi())]
})
export class DashboardModule { }
