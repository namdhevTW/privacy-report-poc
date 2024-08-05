import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { MatIconModule } from '@angular/material/icon';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({ declarations: [
        DashboardComponent
    ],
    exports: [
        DashboardComponent
    ], imports: [CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatNativeDateModule,
        MatFormFieldModule,
        MatDatepickerModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class DashboardModule { }
