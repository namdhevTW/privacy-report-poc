import { Component } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  role = "admin";

  changeRole(event: Event) {
    this.role = (event.target as HTMLInputElement)?.value || "admin";
  }
}
