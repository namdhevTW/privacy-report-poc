import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DraftEmailComponent } from './draft-email/draft-email.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@NgModule({
  declarations: [DraftEmailComponent],
  imports: [
    CommonModule,
    FormsModule,
    NzMessageModule,
    NzSelectModule,
    NzButtonModule,
    NzSpinModule,
    QuillModule
  ],
  exports: [DraftEmailComponent]
})
export class SharedModule { }
