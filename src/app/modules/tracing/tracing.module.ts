import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import { SharedModule } from '@app/shared/shared.module';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { CloseOutline } from '@ant-design/icons-angular/icons';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { TracingComponent } from './tracing.component';
import { NzTableModule } from 'ng-zorro-antd/table';

@NgModule({
  declarations: [
    TracingComponent
  ],
  exports: [
    TracingComponent
  ], imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NzSegmentedModule,
    NzTableModule,
    NzIconModule.forChild([CloseOutline]),
    NzSelectModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
  ], providers: [provideHttpClient(withInterceptorsFromDi())]
})
export class TracingModule { }
