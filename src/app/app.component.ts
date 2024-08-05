import { Component } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { DataService } from './services/data/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  role = "admin";
  serviceOwners: {value: string, label: string}[] = [];

  selectedServiceOwner = '';

  constructor(private dataService: DataService) {}

  changeRole(event: Event) {
    this.role = (event.target as HTMLInputElement)?.value || "admin";
    if (this.role === "service-owner") {
      this.serviceOwners = this.dataService.getServices();
    }
  }

  changeServiceOwner(event: any) {
    this.selectedServiceOwner = event.value;
  }
}
