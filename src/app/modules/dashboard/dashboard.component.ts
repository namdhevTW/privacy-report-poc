import { Component } from '@angular/core';
import { EChartsOption } from 'echarts';
import { IPrivacyData } from '@core/models/interfaces/privacy-data';
import { DashboardService } from '@core/services/dashboard/dashboard.service';
import { AuthService } from '@app/core/services/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  role: string = 'admin';
  selectedTab: number = 0;

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

  showDateRangeSelectionErrorStatus = false;
  services: { value: string, label: string }[] = [];
  states: { value: string, label: string }[] = [];
  requestTypes: string[] = [];
  selectedState: string = 'all';
  selectedService: string = 'all';
  selectedRequestType: string = 'All';
  privacyData: IPrivacyData[] = [];

  selectedStartDate!: Date;
  selectedEndDate!: Date;
  presetQuickDateRanges = { Today: [new Date(), new Date()], 'Last 7 Days': [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()], 'Last 30 Days': [new Date(new Date().setDate(new Date().getDate() - 30)), new Date()] };

  slaChartOption: EChartsOption = {};
  requestTypeChartOption: EChartsOption = {};
  serviceOwnerChartOption: EChartsOption = {};
  nonProcessedRequestsByCurrentStageChartOption: EChartsOption = {};

  constructor(private dashboardService: DashboardService, private authService: AuthService) {
    this.states = this.dashboardService.fetchStateOptions();
    this.states.unshift({ value: 'all', label: 'All' });

    this.services = this.dashboardService.fetchServiceOwners();
    this.services.unshift({ value: 'all', label: 'All' });
  }

  ngOnInit() {
    this.dashboardService.getDashboardData().subscribe((data) => {
      this.privacyData = data;

      this.requestTypes = this.dashboardService.fetchUniqueRequestTypes();
      this.requestTypes.unshift('All');

      this.role = this.authService.role;
      if (this.role === 'service-owner') {
        this.selectedService = this.authService.serviceOwner;
        this.applyFilter();
      }
      this.updateRequestStats(this.privacyData);
      this.setChartOptions();
    });


    this.authService.roleChangeSubject.subscribe((role) => {
      this.role = role;
      if (this.role === 'service-owner') {
        this.selectedService = this.authService.serviceOwner;
      } else {
        this.selectedService = 'all';
      }
      this.applyFilter();
    });

    this.authService.serviceOwnerChangeSubject.subscribe((serviceOwner) => {
      this.selectedService = serviceOwner;
      this.applyFilter();
    });
  }

  changeStartDate(event: any) {
    this.selectedStartDate = event.target.value;
  }

  changeEndDate(event: any) {
    this.selectedEndDate = event.target.value;
  }

  changeSelectedTab(tab: number) {
    this.selectedTab = tab;
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

  changeSelectedState(stateSelected: string) {
    this.selectedState = stateSelected;
  }

  changeSelectedService(serviceSelected: string) {
    this.selectedService = serviceSelected;
  }

  disabledDates(date: Date): boolean {
    return date > new Date() || date < new Date('2018-01-01');
  }

  changeSelectedRequestCreatedDate(result: Date) {
    if (Array.isArray(result)) {
      this.selectedStartDate = result[0];
      this.selectedEndDate = result[1];

      this.showDateRangeSelectionErrorStatus = this.disabledDates(this.selectedStartDate) || this.disabledDates(this.selectedEndDate);
    }
  }

  applyFilter() {
    this.privacyData = this.dashboardService.applyDashboardFilters(this.selectedService, this.selectedState, this.selectedRequestType, this.selectedStartDate, this.selectedEndDate);
    this.updateRequestStats(this.privacyData);
    this.setChartOptions();
  }

  removeFilter() {
    this.selectedState = 'all';
    this.selectedService = 'all';
    this.selectedRequestType = 'All';
    this.privacyData = this.dashboardService.removeDashboardFilters(this.selectedService);
    this.updateRequestStats(this.privacyData);
    this.setChartOptions();
  }

  isSLADataUnavailable(): boolean {
    return this.requestStats.nearingSLAInAWeek === 0 && this.requestStats.breached === 0 && this.requestStats.inSLA === 0;
  }

  private setChartOptions(): void {
    this.slaChartOption = this.dashboardService.fetchSLAComplianceChartOptions(this.requestStats);
    this.requestTypeChartOption = this.dashboardService.fetchRequestTypePieChartOptions(this.privacyData);
    this.serviceOwnerChartOption = this.dashboardService.fetchServiceOwnerRequestTypeHeatMapChartOptions(this.privacyData);
    this.nonProcessedRequestsByCurrentStageChartOption = this.dashboardService.fetchNonProcessedRequestsByCurrentStageBarChartOption(this.privacyData);
  }

  private updateRequestStats(data: IPrivacyData[]) {
    this.requestStats = this.dashboardService.calculateTotals(data);
  }
}

