import { Component } from '@angular/core';
import { DataService } from '@core/services/data/data.service';
import { AuthService } from '@core/services/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  role = "admin";
  isCollapsed = false;
  serviceOwners: { value: string, label: string }[] = [];

  selectedServiceOwner = '';

  constructor(private dataService: DataService, private authService: AuthService) {
    document.title = 'Privacy reporting portal';
  }

  changeRole(selectedRole: string) {
    this.role = selectedRole || "admin";
    if (this.role === "service-owner") {
      this.serviceOwners = this.dataService.getServices();
      this.selectedServiceOwner = this.serviceOwners[0].value;
    }
    this.authService.setRole(this.role);
  }

  changeServiceOwner(selectedServiceOwner: string) {
    this.selectedServiceOwner = selectedServiceOwner;
    this.authService.setServiceOwner(selectedServiceOwner);
  }

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}
