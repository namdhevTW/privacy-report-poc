import { Component, Input, SimpleChanges } from '@angular/core';
import { IPrivacyData, DataService } from '../services/data/data.service';
import { color, EChartsOption } from 'echarts';

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

  _totalOptOuts = 0;
  _totalOptOutsCompleted = 0;
  _totalOptOutsPending = 0;
  _totalOptOutsRejected = 0;
  _totalOptOutsNearingSLAInAWeek = 0;
  _totalOptOutsBreached = 0;

  _dataService: DataService;
  _privacyData: IPrivacyData[] = [];
  _isEndDateInvalid: boolean;
  _isStartDateTooEarly: boolean;
  _isStartDateInFuture: boolean;

  displayFilters = false;
  services: { value: string, label: string }[] = [];
  states: { value: string, label: string }[] = [];
  selectedState: string = '';
  selectedService: string = '';
  privacyData: IPrivacyData[] = [];

  minDate: Date;
  maxDate: Date;

  startDate!: Date;
  endDate!: Date;

  chartOption: EChartsOption = {};



  constructor(dataService: DataService) {
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

        this.setPendingRequestsSLAChartOptions();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["selectedServiceOwner"] && !changes["selectedServiceOwner"].isFirstChange() && changes["selectedServiceOwner"].currentValue != changes["selectedServiceOwner"].previousValue) {
      this.selectedService = this.selectedServiceOwner;
      this.applyFilter();
    } else {
      this.selectedService = '';
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

  getTotalOptOuts() {
    this._totalOptOuts = this.privacyData.filter(d => d.requestType.includes('opt out')).length;
    return this._totalOptOuts;
  }

  getTotalOptOutsCompleted() {
    this._totalOptOutsCompleted = this.privacyData.filter(d => d.requestType.includes('opt out') && d.currentStage === 'Completed').length;
    return this._totalOptOutsCompleted;
  }

  getTotalOptOutsPending() {
    this._totalOptOutsPending = this.privacyData.filter(d => d.requestType.includes('opt out') && d.currentStage !== 'Completed' && d.currentStage !== 'Rejected').length;
    return this._totalOptOutsPending;
  }

  getTotalOptOutsRejected() {
    this._totalOptOutsRejected = this.privacyData.filter(d => d.requestType.includes('opt out') && d.currentStage === 'Rejected').length;
    return this._totalOptOutsRejected;
  }

  getTotalOptOutsNearingSLAInAWeek() {
    this._totalOptOutsNearingSLAInAWeek = this.privacyData.filter(d => d.requestType.includes('opt out') && d.currentStage !== 'Completed' && d.currentStage !== 'Rejected' && Number(d.slaDays) < 7 && Number(d.slaDays) > 0).length;
    return this._totalOptOutsNearingSLAInAWeek;
  }

  getTotalOptOutsBreached() {
    this._totalOptOutsBreached = this.privacyData.filter(d => d.requestType.includes('opt out') && d.currentStage !== 'Completed' && d.currentStage !== 'Rejected' && Number(d.slaDays) < 0).length;
    return this._totalOptOutsBreached;
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

  getSLAGGraphSize(): number {
    return Math.max(this._totalRequestsPending, this._totalNearingSLAInAWeek, this._totalRequestsBreached);
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
    this.setPendingRequestsSLAChartOptions();
  }

  removeFilter() {
    this.selectedState = '';
    if (this.selectedServiceOwner != '') {
      this.selectedService = this.selectedServiceOwner;
      this.applyFilter();
    } else {
      this.privacyData = this._privacyData;
      this.selectedService = '';
    }
  }

  private setPendingRequestsSLAChartOptions(): void {
    this.chartOption = {
      title: {
        text: "SLA Compliance",
        subtext: "SLA compliance of non-processed requests",
        textStyle: {
          fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 20,
        },
        subtextStyle: {
          fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 16,
        },
        left: "center",
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
        textStyle: {
          fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 16,
        },
      },
      calculable: true,
      itemStyle: {
        shadowBlur: 200,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
      },
      series: [
        {
          name: 'SLA Compliance',
          type: 'pie',
          height: '140%',
          radius: ['40%', '70%'],
          center: ['50%', '70%'],
          startAngle: 180,
          endAngle: 360,
          label: {
            show: true,
            position: 'outer',
            formatter: '{b} : {c} ({d}%)',
            fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: 13,
          },
          color: ["#047857", "#facc15", "#dc2626"],
          // color: ["rgb(16 185 129)", "rgb(253 224 71)", "rgb(248 113 113)"],
          data: [
            { value: this.getTotalRequestsPending(), name: 'Compliant' },
            { value: this.getTotalNearingSLAInAWeek(), name: 'Nearing breach' },
            { value: this.getTotalRequestsBreached(), name: 'Breached' },
          ],
        },
      ],
      animationType: 'scale',
      animationEasing: 'quadraticOut',
      animationDelay: () => Math.random() * 200,
    };
  }

}
