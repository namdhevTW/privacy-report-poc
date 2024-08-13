import { Component, Input, SimpleChanges } from '@angular/core';
import { IPrivacyData, DataService } from '../services/data/data.service';
import { EChartsOption } from 'echarts';

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

  slaChartOption: EChartsOption = {};
  requestTypeChartOption: EChartsOption = {};
  serviceOwnerChartOption: EChartsOption = {};

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

        if (this.selectedServiceOwner !== '') {
          this.selectedService = this.selectedServiceOwner;
          this.applyFilter();
        }

        this.setChartOptions();
      },
      error: (error) => {
        // tslint:disable-next-line: no-console
        console.error(error);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // tslint:disable-next-line:no-string-literal
    if (changes["selectedServiceOwner"] && !changes["selectedServiceOwner"].isFirstChange() && changes["selectedServiceOwner"].currentValue !== changes["selectedServiceOwner"].previousValue) {
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

  getTotalRequestsInSLA() {
    return this.privacyData.filter(d => d.currentStage !== 'Completed' && d.currentStage !== 'Rejected' && Number(d.slaDays) >= 7).length;
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
    this.privacyData = this._privacyData.filter((d) => {
      if (this.selectedState && d.state !== this.selectedState && this.selectedState !== "all") {
        return false;
      }
      if (this.selectedService && d.serviceOwner !== this.selectedService && this.selectedService !== "all") {
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
    this.setChartOptions();
  }

  removeFilter() {
    this.selectedState = '';
    if (this.selectedServiceOwner !== '') {
      this.selectedService = this.selectedServiceOwner;
      this.applyFilter();
    } else {
      this.privacyData = this._privacyData;
      this.selectedService = '';
    }
  }

  isSLADataUnavailable(): boolean {
    return this.getTotalNearingSLAInAWeek() === 0 && this.getTotalRequestsBreached() === 0 && this.getTotalRequestsInSLA() === 0;
  }

  private setPendingRequestsSLAChartOptions(): void {
    this.slaChartOption = {
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
          padAngle: 5,
          itemStyle: {
            borderRadius: 10
          },
          radius: ['40%', '70%'],
          center: ['50%', '70%'],
          startAngle: 180,
          endAngle: 360,
          showEmptyCircle: this.isSLADataUnavailable(),
          emptyCircleStyle: {
            color: 'transparent',
            borderColor: '#ddd',
            borderWidth: 1
          },
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
            { value: this.getTotalRequestsInSLA(), name: 'Compliant' },
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

  private setChartOptions(): void {
    this.setPendingRequestsSLAChartOptions();
    this.setRequestTypesChartOptions();
    this.setServiceOwnerChartOptions();
  }

  private setRequestTypesChartOptions(): void {
    // Set requestTypeChartOption with request types and their count by using getUniquePendingRequestTypesWithCount function and display in pie chart with echarts and rose type layout
    this.requestTypeChartOption = {
      title: {
        text: 'Request type distribution',
        subtext: `Request type distribution for the ${this.getTotalRequestsPending()} non-processed requests`,
        textStyle: {
          fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 20,
        },
        subtextStyle: {
          fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 16,
          align: 'center',
          lineHeight: 20,
        },
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b} : <br/> {c} ({d}%)',
        textStyle: {
          fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 14,
        },
      },
      calculable: true,
      itemStyle: {
        shadowBlur: 200,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
      },
      legend: {
        orient: 'vertical',
        bottom: 0,
        left: 0,
        data: this.getUniquePendingRequestTypesWithCount().map(d => d.name),
        textStyle: {
          fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 14,
        },
      },
      series: [
        {
          name: 'Request type',
          type: 'pie',
          padAngle: 5,
          itemStyle: {
            borderRadius: 15,
            borderWidth: 0.5
          },
          radius: ['35%', '45%'],
          // color: ['#047857', '#facc15', '#dc2626'],
          label: {
            show: true,
            position: 'outside',
            formatter: '{c} - ({d}%)',
            fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: 12,
          },
          // color: ["rgb(16 185 129)", "rgb(253 224 71)", "rgb(248 113 113)"],
          data: this.getUniquePendingRequestTypesWithCount(),
        },
      ],
      animationType: 'scale',
      animationEasing: 'quadraticOut',
      animationDelay: () => Math.random() * 200,
    };
  }

  private setServiceOwnerChartOptions(): void {
    this.serviceOwnerChartOption = {
      title: {
        text: 'Non-processed Request types per Service Owner',
        subtext: `Non-processed Request types per Service Owner\n for the ${this.getTotalRequestsPending()} non-processed requests`,
        textStyle: {
          fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 20,
        },
        subtextStyle: {
          fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 16,
          align: 'center',
          width: '90%',
        },
        left: 'center',
      },
      tooltip: {
        position: 'top',
        textStyle: {
          fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 14,
        },
      },
      grid: {
        height: '50%',
        top: 'center',
        containLabel: true,

      },
      xAxis: {
        type: 'category',
        data: this.getUniqueRequestTypes(),
        splitArea: {
          show: true,
        },
        axisLabel: {
          fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 12,
        },
      },
      yAxis: {
        type: 'category',
        data: this.services.map(d => d.label),
        splitArea: {
          show: true,
        },
        axisLabel: {
          fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 12,
        },
      },
      visualMap: {
        min: 0,
        max: 10, //Math.max(...this.getUniqueServiceOwnersWithRequestTypesAndNonProcessedRequestCount().map(d => d[2])),
        showLabel: true,
        borderMiterLimit: 1,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '5%',
        textStyle: {
          fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 12,
        },
        inRange: {
          color: ['#047857', '#facc15', '#dc2626'],
        },
      },
      series: [
        {
          name: 'Non-processed Requests',
          type: 'heatmap',
          data: this.getUniqueServiceOwnersWithRequestTypesAndNonProcessedRequestCount().map(d => [d[0], d[1], d[2]]),
          label: {
            show: true,
            color: '#000',
            fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: 12,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
  };

  private getUniquePendingRequestTypesWithCount(): { value: number, name: string }[] {
    // Get unique request types with count and map request type to name and count to value
    const requestTypes = this.privacyData
      .filter(d => d.currentStage !== 'Completed' && d.currentStage !== 'Rejected')
      .map(d => d.requestType)
      .reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

    // sort request types by count in descending order
    Object.keys(requestTypes).sort((a, b) => requestTypes[b] - requestTypes[a]);
    return Object.keys(requestTypes).map(key => ({ name: key, value: requestTypes[key] }));
  }

  private getUniqueServiceOwnersWithRequestTypesAndNonProcessedRequestCount(): [requestType: string, serviceOwner: string, count: number][] {
    // Get unique service owners with request types and count and map request type to requestType, service owner to serviceOwner and count to count
    const serviceOwners = this.privacyData
      .filter(d => d.currentStage !== 'Completed' && d.currentStage !== 'Rejected')
      .map(d => ({ requestType: d.requestType, serviceOwner: d.serviceOwner }))
      .reduce((acc, curr) => {
        const key = `${curr.requestType}-${curr.serviceOwner}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

    const uniqueServiceOwners = Array.from(new Set(this.privacyData
      .filter(d => d.currentStage !== 'Completed' && d.currentStage !== 'Rejected')
      .map(d => d.serviceOwner)));

    const uniqueRequestTypes = Array.from(new Set(this.privacyData
      .filter(d => d.currentStage !== 'Completed' && d.currentStage !== 'Rejected')
      .map(d => d.requestType)));

    const result: [string, string, number][] = [];

    uniqueRequestTypes.forEach(requestType => {
      uniqueServiceOwners.forEach(serviceOwner => {
        const key = `${requestType}-${serviceOwner}`;
        const serviceOwnerLabel = this.services.find(s => s.value === serviceOwner)?.label || serviceOwner;
        const count = serviceOwners[key] || 0;
        result.push([requestType, serviceOwnerLabel, count]);
      });
    });

    return result;
  }
}

