import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  @Input() role = "admin";


  displayFilters = false;
  services = [];
  states = [];


  displayFriendlyRole() {
    switch (this.role) {
      case "admin":
        return "Administrator";
      case "service-owner":
        return "Service owner";
      default:
        return "User";
    }
  }

  toggleFilters() {
    this.displayFilters = !this.displayFilters;
  }
}
