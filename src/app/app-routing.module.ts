import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { TracingComponent } from './modules/tracing/tracing.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'tracing', component: TracingComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' },
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, { useHash: true })
  ],
  exports: [RouterModule],
  providers: [],
})
export class AppRoutingModule { }
