import { Component, TemplateRef } from '@angular/core';
import { ECElementEvent, EChartsOption } from 'echarts';
import { IPrivacyData } from '@core/models/interfaces/privacy-data';
import { DashboardService, SeriesNames, SLAChartLabels } from '@core/services/dashboard/dashboard.service';
import { AuthService } from '@app/core/services/auth/auth.service';
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'dashboard',
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
  states: string[] = [];
  requestTypes: string[] = [];
  selectedState: string = 'All';
  selectedService: string = 'all';
  selectedRequestType: string = 'All';
  privacyData: IPrivacyData[] = [];
  modalData: IPrivacyData[] = [];
  modalCols: string[] = ['requestId', 'requestType', 'currentStage', 'requestCreatedDate', 'slaDays'];
  modalPageSize: number = 5;
  consentModeOn: boolean = false;

  selectedStartDate: Date = new Date(new Date().setDate(new Date().getDate() - 90));
  selectedEndDate: Date = new Date();
  presetQuickDateRanges = {
    'Last 7 Days': [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()],
    'Last 30 Days': [new Date(new Date().setDate(new Date().getDate() - 30)), new Date()],
    'Last 90 Days': [new Date(new Date().setDate(new Date().getDate() - 90)), new Date()],
    'Last 6 Months': [new Date(new Date().setDate(new Date().getDate() - 180)), new Date()],
    'Last 1 Year': [new Date(new Date().setDate(new Date().getDate() - 365)), new Date()],

  };

  pendingRequestsByServiceOwnerChartOption: EChartsOption = {};
  slaStatusChartOption: EChartsOption = {};
  requestAgingForServiceOwnerChartOption: EChartsOption = {};
  requestTypeChartOption: EChartsOption = {};
  pendingRequestsByCurrentStageChartOption: EChartsOption = {};
  serviceOwnerByCurrentStageChartOption: EChartsOption = {};
  serviceOwnerSubtasksCreatedTimeLineChartOption: EChartsOption = {};

  _dateRangeControl: any;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private modalService: NzModalService,
  ) {
    this.services = this.dashboardService.serviceMapping?.map(service => ({ value: service.value, label: service.name })) || [];
    if (this.services.length > 0) {
      this.services.unshift({ value: 'all', label: 'All' });
    }
  }

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe((data) => {
      this.privacyData = data;

      this.states = this.dashboardService.fetchStateOptions();
      this.states.unshift('All');

      this.requestTypes = this.dashboardService.fetchUniqueRequestTypes();
      this.requestTypes.unshift('All');

      if (this.services.length === 0) {
        this.dashboardService.getServiceMappingData().subscribe((data) => {
          this.services = data.map(service => ({ value: service.value, label: service.name }));
          this.services.unshift({ value: 'all', label: 'All' });

          this.role = this.authService.role;
          if (this.role === 'service-owner') {
            this.selectedService = this.authService.serviceOwner;
            this.applyFilter();
          }
          this.updateRequestStats(this.privacyData);
          this.applyFilter();
        });
      }
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

  ngOnDestroy(): void {
    this.modalData = [];
  }

  changeSelectedTab(tab: number): void {
    this.selectedTab = tab;
  }

  changeSelectedState(stateSelected: string): void {
    this.selectedState = stateSelected;
  }

  changeSelectedService(serviceSelected: string) {
    this.selectedService = serviceSelected;
  }

  disabledDates(date: Date): boolean {
    return date > new Date() || date < new Date('2018-01-01');
  }

  changeSelectedDateRange(result: Date): void {
    if (Array.isArray(result)) {
      if (result.length > 0) {
        this.selectedStartDate = result[0];
        this.selectedEndDate = result[1];
      } else {
        this.setDefaultDateRange();
      }
      this.applyFilter();
    }
  }

  changeSelectedRequestCompletedDate(result: Date): void {
    if (Array.isArray(result)) {
      this.selectedStartDate = result[0];
      this.selectedEndDate = result[1];

      this.applyFilter();
    }
  }

  isSLADataUnavailable(): boolean {
    return this.requestStats.nearingSLAInAWeek === 0 && this.requestStats.breached === 0 && this.requestStats.inSLA === 0;
  }

  storeDateRangeControl(control: NzDatePickerComponent): void {
    this._dateRangeControl = control;
  }

  onStatsClickEvent(statClicked: string, templateRef: TemplateRef<{}>): void {
    this.modalData = this.privacyData;
    if (statClicked === 'All' && this.modalData.length > 0) {
      this.openModal('All Requests', templateRef);
    } else if (statClicked === 'Pending') {
      this.modalData = this.privacyData.filter(d => this.dashboardService.isRequestPending(d));
      this.modalPageSize = 10;
      if (this.modalData.length > 0) {
        this.openModal('Pending Requests', templateRef);
      }
    } else if (statClicked === 'Completed') {
      this.modalData = this.privacyData.filter(d => this.dashboardService.isRequestCompleted(d));
      if (this.modalData.length > 0) {
        this.openModal('Completed Requests', templateRef);
      }
    } else if (statClicked === 'Rejected') {
      this.modalData = this.privacyData.filter(d => this.dashboardService.isRequestRejected(d));
      if (this.modalData.length > 0) {
        this.openModal('Rejected Requests', templateRef);
      }
    }
  }

  onChartClickEvent(event: ECElementEvent, templateRef: TemplateRef<{}>): void {
    this.modalData = this.privacyData;
    let eventData = event.data as string[];
    switch (event.seriesName) {
      case SeriesNames.PendingByServiceOwner:
        this.setModalDataByServiceOwner(event);
        this.modalCols = ['requestId', 'currentStage', 'requestCreatedDate', 'slaDays'];
        this.openModal(`Data for ${SeriesNames.PendingByServiceOwner}`, templateRef);
        break;
      case SeriesNames.PendingRequestsAgingForServiceOwner:
        this.modalData = this.privacyData.filter(d => d.serviceOwner === this.selectedService && d.requestId === event.name);
        this.modalCols = ['requestId', 'currentStage', 'requestCreatedDate', 'subTaskCreatedDate', 'slaDaysLeft'];
        this.openModal(`Data for ${SeriesNames.PendingRequestsAgingForServiceOwner} - ${this.services.filter(d => d.value === this.selectedService).map(d => d.label)}`, templateRef);
        break;
      case SeriesNames.PendingRequestsSLAStatus:
        this.setModalDataBasedOnSLA(event);
        this.modalCols = this.selectedService === 'all' ? ['requestId', 'requestType', 'currentStage', 'serviceOwner', 'requestCreatedDate', 'slaDays'] : ['requestId', 'currentStage', 'subtaskCreatedDate', 'requestCreatedDate', 'slaDaysLeft'];
        this.openModal(`Data for ${SeriesNames.PendingRequestsSLAStatus}`, templateRef);
        break;
      case SeriesNames.PendingRequestsByCurrentStage:
        this.modalData = this.privacyData.filter(d => d.currentStage === event.name.replace(/\n/g, '-'));
        this.modalCols = ['requestId', 'currentStage', 'requestCreatedDate', 'slaDays'];
        if (this.role == 'admin') {
          this.modalCols = [...this.modalCols, 'serviceOwner'];
        }
        this.openModal(`Data for ${SeriesNames.PendingRequestsByCurrentStage}`, templateRef);
        break;
      case SeriesNames.PendingRequestsByServiceOwnerAndCurrentStage:
        eventData[1] = this.services.find(s => s.label === eventData[1])?.value ?? eventData[1];
        if (Number(eventData[2]) === 0) {
          break;
        }
        this.modalData = this.privacyData.filter(d => d.serviceOwner === eventData[1] && d.currentStage === eventData[0] && this.dashboardService.isRequestPending(d));
        this.modalCols = ['requestId', 'currentStage', 'serviceOwner', 'requestCreatedDate', 'slaDays'];
        this.openModal(`Data for ${SeriesNames.PendingRequestsByServiceOwnerAndCurrentStage}`, templateRef);
        break;
      case SeriesNames.PendingRequestTypeDistribution:
        this.modalData = this.privacyData.filter(d => d.requestType === event.name && this.dashboardService.isRequestPending(d));
        this.modalCols = ['requestId', 'requestType', 'currentStage', 'serviceOwner', 'requestCreatedDate', 'slaDays'];
        this.openModal(`Data for ${SeriesNames.PendingRequestTypeDistribution}`, templateRef);
        break;
      default:
        this.openModal('Current dashboard data', templateRef);
        break;
    }
  }

  applyFilter(): void {
    this.privacyData = this.dashboardService.applyDashboardFilters(this.selectedService, this.selectedState, this.selectedRequestType, this.selectedStartDate, this.selectedEndDate, this.consentModeOn);
    this.updateRequestStats(this.privacyData);
    this.setChartOptions();
  }

  removeFilter(): void {
    this.selectedState = 'All';
    this.selectedRequestType = 'All';
    this.consentModeOn = false;
    if (this.role === 'admin') {
      this.selectedService = 'all';
    }
    // if (this._requestCreatedDateRangeControl?.rangePickerInputs?.first) {
    //   this.clearRequestCreatedDateInputs();
    // }
    this.privacyData = this.dashboardService.removeDashboardFilters(this.selectedService);
    this.setDefaultDateRange();
    this.applyFilter();
    this.updateRequestStats(this.privacyData);
  }

  private clearDateInputs(): void {
    this._dateRangeControl.rangePickerInputs.first.nativeElement.value = '';
    this._dateRangeControl.rangePickerInputs.last.nativeElement.value = '';
  }

  private setChartOptions(): void {
    this.slaStatusChartOption = this.dashboardService.fetchSLAComplianceChartOptions(this.requestStats);
    this.requestTypeChartOption = this.dashboardService.fetchRequestTypePieChartOptions(this.privacyData);
    this.serviceOwnerByCurrentStageChartOption = this.dashboardService.fetchServiceOwnerAndCurrentStageMapChartOption(this.privacyData);
    this.pendingRequestsByCurrentStageChartOption = this.dashboardService.fetchPendingRequestsByCurrentStageBarChartOption(this.privacyData);
    this.pendingRequestsByServiceOwnerChartOption = this.dashboardService.fetchPendingRequestsDistributionByServiceOwner(this.privacyData, this.selectedService);
    if (this.selectedService !== 'all') {
      this.requestAgingForServiceOwnerChartOption = this.dashboardService.fetchServiceOwnerBasedRequestAgingBarChartOption(this.privacyData, this.selectedService);
      this.serviceOwnerSubtasksCreatedTimeLineChartOption = this.dashboardService.fetchSubtasksCreatedTimeChartOptions(this.privacyData, this.selectedService, this.selectedStartDate, this.selectedEndDate);
    }
  }

  private setDefaultDateRange(): void {
    this.selectedStartDate = this.presetQuickDateRanges['Last 90 Days'][0];
    this.selectedEndDate = new Date();
  }

  private updateRequestStats(data: IPrivacyData[]): void {
    this.requestStats = this.dashboardService.calculateTotals(data, this.selectedService);
  }

  private openModal(title: string, templateRef: TemplateRef<{}>): void {
    this.modalService.create({
      nzTitle: title,
      nzContent: templateRef,
      nzFooter: null,
      nzWidth: '60%',
    });
  }

  private setModalDataByServiceOwner(event: ECElementEvent): void {
    let serviceOwners = this.services.filter(s => s.label === event.name);
    this.modalData = this.privacyData.filter(d => d.serviceOwner === serviceOwners[0].value);
  }

  private setModalDataBasedOnSLA(event: ECElementEvent): void {
    switch ((event.data as any)?.name) {
      case SLAChartLabels.ExceedsSLA:
        this.modalData = this.privacyData.filter(d => this.selectedService === 'all' ? this.dashboardService.isRequestPending(d) && Number(d.slaDays) <= 0 : this.dashboardService.isRequestPending(d) && Number(d.slaDaysLeft) < 0);
        break;
      case SLAChartLabels.NearingSLA:
        this.modalData = this.privacyData.filter(d => this.selectedService === 'all' ? this.dashboardService.isRequestPending(d) && Number(d.slaDays) > 0 && Number(d.slaDays) < 7 : this.dashboardService.isRequestPending(d) && Number(d.slaDaysLeft) === 0);
        break;
      case SLAChartLabels.MeetsSLA:
        this.modalData = this.privacyData.filter(d => this.selectedService === 'all' ? this.dashboardService.isRequestPending(d) && Number(d.slaDays) >= 7 : this.dashboardService.isRequestPending(d) && Number(d.slaDaysLeft) > 0);
        break;
    }
  }
}

