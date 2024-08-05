import { Component, Input } from '@angular/core';
import { IPrivacyData, DataService } from '../services/data/data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  @Input() role = "admin";


  displayFilters = false;
  services: {value: string, label: string}[] = [];
  states: {value: string, label: string}[] = [];
  selectedState : string = '';
  selectedService: string = '';

  // _dataService: DataService;

  minDate: Date;
  maxDate: Date;

  startDate!: Date;
  endDate!: Date;

  privacyData: IPrivacyData[] = [];

  constructor() {
    this.minDate = new Date(2018, 1, 1);
    this.maxDate = new Date();
    this.states = [
      { value: "CA", label: "California" },
      { value: "CO", label: "Colarado" },
      { value: "CT", label: "Connecticut" },
      { value: "FL", label: "Florida" },
      { value: "MO", label: "Montana" },
      { value: "NE", label: "Nevada" },
    ];

    this.services = [
      { value: "service-1", label: "Service 1" },
      { value: "service-2", label: "Service 2" },
      { value: "service-3", label: "Service 3" },
      { value: "service-4", label: "Service 4" },
      { value: "service-5", label: "Service 5" },
    ];
  }


  ngOnInit() {
    // TODO - Read from data service
    // this._dataService.getPrivacyData().subscribe(data => {
    //   this.privacyData = data;
    // });
  }


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

  changeSelectedState(event: any) {
    this.selectedState = event.target.value;
  }

  changeSelectedService(event: any) {
    this.selectedService = event.target.value;
  }



}
