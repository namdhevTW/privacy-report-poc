import { Component, Input, SimpleChanges } from '@angular/core';
import { IPrivacyData, DataService } from '../services/data/data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  @Input() role = "admin";
  @Input() selectedServiceOwner = '';

  _totalRequests = 0;
  _totalRequestsCompleted = 0;
  _totalRequestsPending = 0;
  _totalRequestsRejected = 0;
  _totalNearingSLAInAWeek = 0;
  _totalRequestsBreached = 0;
  _dataService: DataService;
  _privacyData: IPrivacyData[] = [];
  _isEndDateInvalid: boolean;
  _isStartDateTooEarly: boolean;
  _isStartDateInFuture: boolean;

  displayFilters = false;
  services: {value: string, label: string}[] = [];
  states: {value: string, label: string}[] = [];
  selectedState : string = '';
  selectedService: string = '';
  privacyData: IPrivacyData[] = [];

  minDate: Date;
  maxDate: Date;

  startDate!: Date;
  endDate!: Date;


  constructor(private dataService: DataService) {
    this._dataService = dataService;
    this.minDate = new Date(2018, 1, 1);
    this.maxDate = new Date();
    this.states = this._dataService.getStates();
    this.services = this._dataService.getServices();
    this._isEndDateInvalid = this.endDate && this.startDate > this.endDate;
    this._isStartDateInFuture = this.startDate > new Date();
    this._isStartDateTooEarly = this.startDate < this.minDate;
  }


  ngOnInit() {
    this._dataService.getPrivacyData().subscribe({
      next: (data) => {
        this.privacyData = data;
        this._privacyData = data;

        if (this.selectedServiceOwner != '') {
          this.selectedService = this.selectedServiceOwner;
          this.applyFilter();
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes["selectedServiceOwner"].isFirstChange() && this.selectedServiceOwner != '') {
      this.selectedService = this.selectedServiceOwner;
      this.applyFilter();
    }
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

  getTotalRequests() {
    this._totalRequests = this.privacyData.length;
    return this._totalRequests;
  }

  getTotalRequestsCompleted() {
    this._totalRequestsCompleted = this.privacyData.filter(d => d.currentStage === 'Completed').length;
    return this._totalRequestsCompleted;
  }

  getTotalRequestsPending() {
    this._totalRequestsPending = this.privacyData.filter(d => d.currentStage !== 'Completed' && d.currentStage !== 'Rejected').length;
    return this._totalRequestsPending;
  }

  getTotalRequestsRejected() {
    this._totalRequestsRejected = this.privacyData.filter(d => d.currentStage === 'Rejected').length;
    return this._totalRequestsRejected;
  }

  getTotalNearingSLAInAWeek() {
    this._totalNearingSLAInAWeek = this.privacyData.filter(d => d.currentStage !== 'Completed' && d.currentStage !== 'Rejected' && Number(d.slaDays) < 7 && Number(d.slaDays) > 0).length;
    return this._totalNearingSLAInAWeek;
  }

  getTotalRequestsBreached() {
    this._totalRequestsBreached = this.privacyData.filter(d => d.currentStage !== 'Completed' && d.currentStage !== 'Rejected' && Number(d.slaDays) < 0).length;
    return this._totalRequestsBreached;
  }

  changeStartDate(event: any) {
    this.startDate = event.target.value;
  }

  isStartDateValid(): boolean {
    return this._isEndDateInvalid || this._isStartDateTooEarly || this._isStartDateInFuture;
  }

  changeEndDate(event: any) {
    this.endDate = event.target.value;
  }

  isEndDateValid(): boolean {
    if (this.startDate && this.endDate > new Date()) {
      return false
    }
    return true;
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


  applyFilter() {
    this.privacyData = this._privacyData.filter((d) => {
      if (this.selectedState && d.state !== this.selectedState && this.selectedState != "all") {
        return false;
      }
      if (this.selectedService && d.serviceOwner !== this.selectedService && this.selectedService != "all") {
        return false;
      }
      if (this.startDate && new Date(d.requestCreatedDate) < this.startDate) {
        return false;
      }
      if (this.endDate && new Date(d.requestCreatedDate) > this.endDate) {
        return false;
      }
      return true;
    });
  }

  removeFilter() {
    this.privacyData = this._privacyData;
    this.selectedService='';
    this.selectedState='';
  }

}
