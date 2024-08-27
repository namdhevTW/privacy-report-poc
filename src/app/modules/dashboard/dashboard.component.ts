import { Component, TemplateRef } from '@angular/core';
import { ECElementEvent, EChartsOption } from 'echarts';
import { IPrivacyData } from '@core/models/interfaces/privacy-data';
import { DashboardService, SeriesNames, SLAComplianceTypes } from '@core/services/dashboard/dashboard.service';
import { AuthService } from '@app/core/services/auth/auth.service';
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';
import { NzModalService } from 'ng-zorro-antd/modal';

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
  };

  services: { value: string, label: string }[] = [];
  states: { value: string, label: string }[] = [];
  requestTypes: string[] = [];
  selectedState: string = 'all';
  selectedService: string = 'all';
  selectedRequestType: string = 'All';
  privacyData: IPrivacyData[] = [];
  modalData: IPrivacyData[] = [];
  consentModeOn: boolean = false;

  selectedStartDate!: Date;
  selectedEndDate!: Date;
  presetQuickDateRanges = {
    'Last 7 Days': [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()],
    'Last 30 Days': [new Date(new Date().setDate(new Date().getDate() - 30)), new Date()],
    'Last 3 Months': [new Date(new Date().setDate(new Date().getDate() - 90)), new Date()],
    'Last 6 Months': [new Date(new Date().setDate(new Date().getDate() - 180)), new Date()],
    'Last 1 Year': [new Date(new Date().setDate(new Date().getDate() - 365)), new Date()],

  };

  pendingRequestsByServiceOwnerChartOption: EChartsOption = {};
  slaChartOption: EChartsOption = {};
  requestTypeChartOption: EChartsOption = {};
  serviceOwnerChartOption: EChartsOption = {};
  nonProcessedRequestsByCurrentStageChartOption: EChartsOption = {};

  _requestCreatedDateRangeControl: any;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private modalService: NzModalService
  ) {
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
      this.setDefaultRequestCreatedDateRange();
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

  ngOnDestroy() {
    this.modalData = [];
  }

  changeSelectedTab(tab: number) {
    this.selectedTab = tab;
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
      if (result.length > 0) {
        this.selectedStartDate = result[0];
        this.selectedEndDate = result[1];
      } else {
        this.setDefaultRequestCreatedDateRange();
      }
      this.applyFilter();
    }
  }

  changeSelectedRequestCompletedDate(result: Date) {
    if (Array.isArray(result)) {
      this.selectedStartDate = result[0];
      this.selectedEndDate = result[1];

      this.applyFilter();
    }
  }

  isSLADataUnavailable(): boolean {
    return this.requestStats.nearingSLAInAWeek === 0 && this.requestStats.breached === 0 && this.requestStats.inSLA === 0;
  }

  storeRequestCreatedDateRangeControl(control: NzDatePickerComponent): void {
    this._requestCreatedDateRangeControl = control;
  }

  onChartClickEvent(event: ECElementEvent, templateRef: TemplateRef<{}>): void {
    if (this.role === 'admin') {
      console.log('Chart Click Event', event);

      this.modalData = this.privacyData;
      switch (event.seriesName) {
        case SeriesNames.NonProcessedSLACompliance:
          this.setModalDataBasedOnSLA(event);
          this.openModal(`Data for - ${SeriesNames.NonProcessedSLACompliance}`, templateRef);
          break;
        case SeriesNames.NonProcessedByCurrentStage:
          this.modalData = this.privacyData.filter(d => d.currentStage === event.name.replace(/\n/g, ' '));
          this.openModal(`Data for - ${SeriesNames.NonProcessedByCurrentStage}`, templateRef);
          break;
        case SeriesNames.NonProcessedByServiceOwnerAndRequestType:
          // TODO - create and open modal with appropriate non processed requests based modal data
          break;
        case SeriesNames.NonProcessedByServiceOwner:
          this.setModalDataByServiceOwner(event);
          this.openModal(`Data for - ${SeriesNames.NonProcessedByServiceOwner}`, templateRef);
          break;
        case SeriesNames.NonProcessedRequestTypeDistribution:
          // TODO - create and open modal with appropriate non processed requests based modal data
          break;
        default:
          this.openModal('Current dashboard data', templateRef);
          break;
      }
    }
  }

  applyFilter() {
    this.privacyData = this.dashboardService.applyDashboardFilters(this.selectedService, this.selectedState, this.selectedRequestType, this.selectedStartDate, this.selectedEndDate, this.consentModeOn);
    this.updateRequestStats(this.privacyData);
    this.setChartOptions();
  }

  removeFilter() {
    this.selectedState = 'all';
    this.selectedRequestType = 'All';
    this.consentModeOn = false;
    if (this.role === 'admin') {
      this.selectedService = 'all';
    }
    if (this._requestCreatedDateRangeControl?.rangePickerInputs?.first) {
      this.clearRequestCreatedDateInputs();
    }
    this.setDefaultRequestCreatedDateRange();
    this.privacyData = this.dashboardService.removeDashboardFilters(this.selectedService);
    this.updateRequestStats(this.privacyData);
    this.setChartOptions();
  }

  private clearRequestCreatedDateInputs() {
    this._requestCreatedDateRangeControl.rangePickerInputs.first.nativeElement.value = '';
    this._requestCreatedDateRangeControl.rangePickerInputs.last.nativeElement.value = '';
  }

  private setChartOptions(): void {
    this.slaChartOption = this.dashboardService.fetchSLAComplianceChartOptions(this.requestStats);
    this.requestTypeChartOption = this.dashboardService.fetchRequestTypePieChartOptions(this.privacyData);
    this.serviceOwnerChartOption = this.dashboardService.fetchServiceOwnerRequestTypeHeatMapChartOptions(this.privacyData);
    this.nonProcessedRequestsByCurrentStageChartOption = this.dashboardService.fetchNonProcessedRequestsByCurrentStageBarChartOption(this.privacyData);
    this.pendingRequestsByServiceOwnerChartOption = this.dashboardService.fetchPendingRequestsDistributionByServiceOwner(this.privacyData);
  }

  private setDefaultRequestCreatedDateRange(): void {
    this.selectedStartDate = new Date(2018, 1, 1);
    this.selectedEndDate = new Date();
  }

  private updateRequestStats(data: IPrivacyData[]) {
    this.requestStats = this.dashboardService.calculateTotals(data);
  }

  private openModal(title: string, templateRef: TemplateRef<{}>): void {
    this.modalService.create({
      nzTitle: title,
      nzContent: templateRef,
      nzFooter: null,
      nzWidth: '80vw',
    });
  }

  private setModalDataByServiceOwner(event: ECElementEvent) {
    let serviceOwners = this.dashboardService.fetchServiceOwners();
    serviceOwners = serviceOwners.filter(s => s.label === event.name);
    this.modalData = this.privacyData.filter(d => d.serviceOwner === serviceOwners[0].value);
  }

  private setModalDataBasedOnSLA(event: ECElementEvent) {
    switch ((event.data as any)?.name) {
      case SLAComplianceTypes.BreachedSLA:
        this.modalData = this.privacyData.filter(d => this.dashboardService.isRequestPending(d) && Number(d.slaDays) <= 0);
        break;
      case SLAComplianceTypes.NearingSLA:
        this.modalData = this.privacyData.filter(d => this.dashboardService.isRequestPending(d) && Number(d.slaDays) > 0 && Number(d.slaDays) < 7);
        break;
      case SLAComplianceTypes.InSLA:
        this.modalData = this.privacyData.filter(d => this.dashboardService.isRequestPending(d) && Number(d.slaDays) >= 7);
        break;
    }
  }
}

