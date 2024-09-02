import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DraftEmailComponent } from './draft-email/draft-email.component';
import { QuillModule } from 'ngx-quill';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [DraftEmailComponent],
  imports: [
    CommonModule,
    FormsModule,
    NzToolTipModule,
    NzSelectModule,
    QuillModule.forRoot(),
  ],
  exports: [DraftEmailComponent]
})
export class SharedModule { }
