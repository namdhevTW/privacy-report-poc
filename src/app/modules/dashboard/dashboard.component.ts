import { Component, Input, SimpleChanges } from '@angular/core';
import { EChartsOption } from 'echarts';
import { IPrivacyData } from '@core/models/interfaces/privacy-data';
import { DashboardService } from '@core/services/dashboard/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  @Input() role = "admin";
  @Input() selectedServiceOwner = '';

  requestStats = {
    all: 0,
    completed: 0,
    pending: 0,
    rejected: 0,
    inSLA: 0,
    nearingSLAInAWeek: 0,
    breached: 0,
    allOptOuts: 0,
    optOutCompleted: 0,
    optOutPending: 0,
    optOutRejected: 0,
    optOutNearingSLAInAWeek: 0,
    optOutBreached: 0
  };

  _isEndDateInvalid: boolean;
  _isStartDateTooEarly: boolean;
  _isStartDateInFuture: boolean;

  displayFilters = false;
  services: { value: string, label: string }[] = [];
  states: { value: string, label: string }[] = [];
  selectedState: string = 'all';
  selectedService: string = 'all';
  selectedRequestType: string = '';
  privacyData: IPrivacyData[] = [];

  minDate: Date;
  maxDate: Date;

  selectedStartDate!: Date;
  selectedEndDate!: Date;

  slaChartOption: EChartsOption = {};
  requestTypeChartOption: EChartsOption = {};
  serviceOwnerChartOption: EChartsOption = {};

  constructor(private dashboardService: DashboardService) {
    this.minDate = new Date(2018, 1, 1);
    this.maxDate = new Date();
    this.states = this.dashboardService.fetchStateOptions();
    this.services = this.dashboardService.fetchServiceOwners();
    this._isEndDateInvalid = this.selectedEndDate && this.selectedStartDate > this.selectedEndDate;
    this._isStartDateInFuture = this.selectedStartDate > new Date();
    this._isStartDateTooEarly = this.selectedStartDate < this.minDate;
  }

  ngOnInit() {
    this.dashboardService.getDashboardData().subscribe((data) => {
      this.privacyData = data;
      this.updateRequestStats(data);

      if (this.selectedServiceOwner !== '') {
        this.selectedService = this.selectedServiceOwner;
        this.applyFilter();
      }
      this.setChartOptions();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // tslint:disable-next-line:no-string-literal
    if (changes["selectedServiceOwner"] && !changes["selectedServiceOwner"].isFirstChange() && changes["selectedServiceOwner"].currentValue !== changes["selectedServiceOwner"].previousValue) {
      this.selectedService = this.selectedServiceOwner;
      this.applyFilter();
    } else {
      this.selectedService = 'all';
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



  changeStartDate(event: any) {
    this.selectedStartDate = event.target.value;
  }

  isStartDateValid(): boolean {
    return this._isEndDateInvalid || this._isStartDateTooEarly || this._isStartDateInFuture;
  }

  changeEndDate(event: any) {
    this.selectedEndDate = event.target.value;
  }

  isEndDateValid(): boolean {
    if (this.selectedStartDate && this.selectedEndDate > new Date()) {
      return false
    }
    return true;
  }

  getUniqueRequestTypes(): string[] {
    return this.privacyData.map(d => d.requestType).filter((value, index, self) => self.indexOf(value) === index);
  }

  toggleFilters() {
    this.displayFilters = !this.displayFilters;
  }

  changeSelectedState(stateSelected: string) {
    this.selectedState = stateSelected;
  }

  changeSelectedService(serviceSelected: string) {
    this.selectedService = serviceSelected;
  }

  applyFilter() {
    this.privacyData = this.dashboardService.applyDashboardFilters(this.selectedService, this.selectedState, this.selectedRequestType, this.selectedStartDate, this.selectedEndDate);
    this.updateRequestStats(this.privacyData);
    this.setChartOptions();
  }

  removeFilter() {
    this.selectedState = 'all';
    this.selectedService = 'all';
    this.privacyData = this.dashboardService.removeDashboardFilters(this.selectedServiceOwner);
    this.updateRequestStats(this.privacyData);
    this.setChartOptions();
  }

  isSLADataUnavailable(): boolean {
    return this.requestStats.nearingSLAInAWeek === 0 && this.requestStats.breached === 0 && this.requestStats.inSLA === 0;
  }

  private setPendingRequestsSLAChartOptions(): void {
    this.slaChartOption = this.dashboardService.fetchSLAComplianceChartOptions(this.requestStats);
  }


  private setChartOptions(): void {
    this.setPendingRequestsSLAChartOptions();
    this.setRequestTypesChartOptions();
    this.setServiceOwnerChartOptions();
  }

  private setRequestTypesChartOptions(): void {
    this.requestTypeChartOption = this.dashboardService.fetchRequestTypePieChartOptions(this.privacyData);
  }

  private setServiceOwnerChartOptions(): void {
    this.serviceOwnerChartOption = this.dashboardService.fetchServiceOwnerRequestTypeHeatMapChartOptions(this.privacyData);
  };

  private updateRequestStats(data: IPrivacyData[]) {
    this.requestStats = this.dashboardService.calculateTotals(data);
  }
}

