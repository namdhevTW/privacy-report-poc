import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { CloseOutline, ExportOutline } from '@ant-design/icons-angular/icons';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { TracingComponent } from './tracing.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { IconDefinition } from '@ant-design/icons-angular';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { SharedModule } from '@app/shared/shared.module';

const icons: IconDefinition[] = [CloseOutline, ExportOutline];

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
    NzSegmentedModule,
    NzTableModule,
    NzToolTipModule,
    NzButtonModule,
    SharedModule,
    NzIconModule.forChild(icons),
    NzSelectModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
  ], providers: [provideHttpClient(withInterceptorsFromDi())]
})
export class TracingModule { }
