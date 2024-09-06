import { Injectable } from '@angular/core';
import { IPrivacyData } from '@core/models/interfaces/privacy-data';
import { DataService } from '../data/data.service';
import { Observable, tap } from 'rxjs';
import { EChartsOption } from 'echarts';
import { IPrivacyRequestStats } from '@app/core/models/interfaces/privacy-request-stats';
import { IServiceMapping } from '@app/core/models/interfaces/service-mapping';

@Injectable({
  providedIn: 'root'
})

export class DashboardService {
  saleShareOptOutRequestTypeText = 'Right to opt out of sale or sharing';
  rightToLimitUseTypeText = 'Right to limit use';

  originalData: IPrivacyData[] = [];
  serviceMapping: IServiceMapping[] = [];

  constructor(private dataService: DataService) { }

  getDashboardData(): Observable<IPrivacyData[]> {
    return this.dataService.getPrivacyData().pipe(
      tap(data => this.originalData = data)
    );
  }

  getServiceMappingData(): Observable<IServiceMapping[]> {
    return this.dataService.getServices().pipe(
      tap(data => this.serviceMapping = data)
    );
  }

  filterDataByServiceOwner(data: IPrivacyData[], serviceOwner: string): IPrivacyData[] {
    return data.filter(d => d.serviceOwner === serviceOwner);
  }

  calculateTotals(data: IPrivacyData[]): IPrivacyRequestStats {
    const totals = {
      all: data.length,
      completed: data.filter(d => this.isRequestCompleted(d)).length,
      pending: data.filter(d => this.isRequestPending(d)).length,
      rejected: data.filter(d => this.isRequestRejected(d)).length,
      inSLA: data.filter(d => this.isRequestPending(d) && Number(d.slaDays) >= 7).length,
      nearingSLAInAWeek: data.filter(d => this.isRequestPending(d) && Number(d.slaDays) > 0 && Number(d.slaDays) < 7).length,
      breached: data.filter(d => this.isRequestPending(d) && Number(d.slaDays) < 0).length,
    };
    return totals;
  }

  fetchStateOptions(): string[] {
    return this.dataService.getStates()
  }

  fetchUniqueRequestTypes(): string[] {
    return this.originalData.map(d => d.requestType).filter((value, index, self) => self.indexOf(value) === index);
  }

  fetchUniqueCurrentStages(): string[] {
    return this.originalData.map(d => d.currentStage).filter((value, index, self) => self.indexOf(value) === index);
  }

  applyDashboardFilters(selectedServiceOwner: string, selectedState: string, selectedRequestType: string, selectedStartDate: Date, selectedEndDate: Date, consentModeOn: boolean): IPrivacyData[] {
    let filteredData = this.originalData;

    if (selectedServiceOwner && selectedServiceOwner !== 'all') {
      filteredData = this.filterDataByServiceOwner(filteredData, selectedServiceOwner);
    }

    if (selectedState && selectedState !== 'All') {
      filteredData = filteredData.filter(d => d.state === selectedState);
    }

    if (selectedRequestType && selectedRequestType !== 'All') {
      filteredData = filteredData.filter(d => d.requestType === selectedRequestType);
    }

    if (selectedStartDate) {
      filteredData = filteredData.filter(d => new Date(d.requestCreatedDate) >= new Date(selectedStartDate));
    }

    if (selectedEndDate) {
      filteredData = filteredData.filter(d => new Date(d.requestCreatedDate) <= new Date(selectedEndDate));
    }

    if (consentModeOn) {
      filteredData = filteredData.filter(d => this.isOptOutRequest(d));
    }

    return filteredData;
  }

  removeDashboardFilters(selectedServiceOwner: string): IPrivacyData[] {
    let filteredData = this.originalData;

    if (selectedServiceOwner && selectedServiceOwner != 'all') {
      filteredData = this.filterDataByServiceOwner(filteredData, selectedServiceOwner);
    }

    return filteredData;
  }

  getUniquePendingRequestTypesWithCount(data: IPrivacyData[]): { value: number, name: string }[] {
    // Get unique request types with count and map request type to name and count to value
    const requestTypes = data
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

  getUniqueServiceOwnersWithCurrentStagesAndPendingRequestCount(data: IPrivacyData[]): [requestType: string, serviceOwner: string, count: number][] {
    // Get unique service owners with request types and count and map request type to requestType, service owner to serviceOwner and count to count
    const serviceOwners = data
      .filter(d => d.currentStage !== 'Completed' && d.currentStage !== 'Rejected')
      .map(d => ({ currentStage: d.currentStage, serviceOwner: d.serviceOwner }))
      .reduce((acc, curr) => {
        const key = `${curr.currentStage}-${curr.serviceOwner}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

    const uniqueServiceOwners = Array.from(new Set(data
      .filter(d => d.currentStage !== 'Completed' && d.currentStage !== 'Rejected')
      .map(d => d.serviceOwner)));

    const uniqueCurrentStages = Array.from(new Set(data
      .filter(d => d.currentStage !== 'Completed' && d.currentStage !== 'Rejected')
      .map(d => d.currentStage)));

    const result: [string, string, number][] = [];

    uniqueCurrentStages.forEach(currentStage => {
      uniqueServiceOwners.forEach(serviceOwner => {
        const key = `${currentStage}-${serviceOwner}`;
        const serviceOwnerLabel = this.serviceMapping.find(s => s.value === serviceOwner)?.name ?? serviceOwner;
        const count = serviceOwners[key] || 0;
        result.push([currentStage, serviceOwnerLabel, count]);
      });
    });

    return result;
  }

  fetchPendingRequestsDistributionByServiceOwner(data: IPrivacyData[], selectedService: string): EChartsOption {
    let serviceOwners = this.serviceMapping.slice(0, 5);
    if (selectedService && selectedService !== 'all') {
      serviceOwners = this.serviceMapping.filter(s => s.value === selectedService);
    }

    let serviceOwnerData = serviceOwners.map(s => {
      const count = data.filter(d => d.serviceOwner === s.value && this.isRequestPending(d)).length;
      return { value: count, name: s.name };
    });

    return {
      title: {
        text: 'Pending requests by service owner',
        subtext: 'Top 5 Service owners with pending requests',
        textStyle: this.getFontBasedStyle(20),
        subtextStyle: this.getFontBasedStyle(16),
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b} : {c}',
        textStyle: this.getFontBasedStyle(14),
      },
      grid: {
        // height: '62.5%',
        // top: '30%',
        // left: 'center',
        bottom: '8%',
        left: '15%',
        height: '65%',
      },
      xAxis: {
        type: 'category',
        data: serviceOwnerData.map(d => d.name),
        axisTick: {
          alignWithLabel: true,
        },
        axisLabel: this.getFontBasedStyle(),
      },
      yAxis: {
        type: 'value',
        axisLabel: this.getFontBasedStyle(),
      },
      series: [
        {
          name: SeriesNames.PendingByServiceOwner,
          type: 'bar',
          realtimeSort: true,
          showBackground: true,
          itemStyle: {
            color: '#f87171',
            borderRadius: [8, 8, 0, 0],
            borderWidth: 2,
          },
          backgroundStyle: {
            color: 'rgba(220, 220, 220, 0.8)',
          },
          data: serviceOwnerData.map(d => d.value),
          label: {
            show: true,
            position: 'inside',
            fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: 14,
            fontWeight: 'bold',
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
  }

  fetchSLAComplianceChartOptions(stats: IPrivacyRequestStats): EChartsOption {
    return {
      title: {
        text: "SLA status",
        subtext: "SLA status of pending requests",
        textStyle: this.getFontBasedStyle(20),
        subtextStyle: this.getFontBasedStyle(16),
        left: "center",
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
        textStyle: this.getFontBasedStyle(16),
      },
      calculable: true,
      itemStyle: {
        shadowBlur: 200,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
      },
      series: [
        {
          name: SeriesNames.PendingRequestsSLAStatus,
          type: 'pie',
          height: '135%',
          itemStyle: {
            borderRadius: 1
          },
          radius: ['60%', '80%'],
          center: ['50%', '70%'],
          startAngle: 180,
          endAngle: 360,
          emptyCircleStyle: {
            color: 'transparent',
            borderColor: '#ddd',
            borderWidth: 1
          },
          label: {
            show: true,
            position: 'outer',
            formatter: '{b} : {c}\n({d}%)',
            fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: 13,
          },
          color: ['#10b981', '#facc15', '#f87171'],
          data: [
            { value: stats.inSLA, name: SLAChartLabels.MeetsSLA },
            { value: stats.nearingSLAInAWeek, name: SLAChartLabels.NearingSLA },
            { value: stats.breached, name: SLAChartLabels.ExceedsSLA },
          ],
        },
      ],
      animationType: 'scale',
      animationEasing: 'quadraticOut',
      animationDelay: () => Math.random() * 200,
    };
  }

  fetchRequestTypePieChartOptions(data: IPrivacyData[]): EChartsOption {
    return {
      title: {
        text: 'Request type distribution',
        subtext: `Request type distribution for pending requests`,
        textStyle: this.getFontBasedStyle(20),
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
        textStyle: this.getFontBasedStyle(14),
      },
      calculable: true,
      itemStyle: {
        shadowBlur: 200,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        left: 0,
        data: this.getUniquePendingRequestTypesWithCount(data).map(d => d.name),
        textStyle: this.getFontBasedStyle(14),
        itemWidth: 10,
      },
      series: [
        {
          name: SeriesNames.PendingRequestTypeDistribution,
          type: 'pie',
          padAngle: 5,
          itemStyle: {
            borderRadius: 15,
            borderWidth: 0.5
          },
          color: ['#10b981', '#facc15', '#f87171', '#3b82f6', '#64748b', '#818cf8', '#a78bfa'],
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
          data: this.getUniquePendingRequestTypesWithCount(data),
        },
      ],
      animationType: 'scale',
      animationEasing: 'sinusoidalIn',
      animationDelay: () => Math.random() * 200,
    };
  }

  fetchPendingRequestsByCurrentStageBarChartOption(data: IPrivacyData[]): EChartsOption {
    let currentStageCounts = data.filter(d => this.isRequestPending(d)).map(d => d.currentStage).reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    currentStageCounts = Object.entries(currentStageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as { [key: string]: number });

    return {
      title: {
        text: 'Pending requests by current Stage',
        subtext: 'Top 10 stages of pending requests',
        textStyle: this.getFontBasedStyle(20),
        subtextStyle: {
          fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 16,
          align: 'center',
          width: '90%',
        },
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        textStyle: this.getFontBasedStyle(14),
      },
      grid: {
        height: '75%',
        top: '20%',
        bottom: 'center',
        left: '5%',
        right: '5%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: Object.keys(currentStageCounts).map(key => key.replace(/-/g, '\n')),
        axisTick: {
          alignWithLabel: true,
        },
        axisLabel: this.getFontBasedStyle(12),
      },
      yAxis: {
        type: 'value',
        axisLabel: this.getFontBasedStyle(12),
      },
      series:
        [
          {
            name: SeriesNames.PendingRequestsByCurrentStage,
            type: 'bar',
            label: {
              show: true,
              position: 'inside',
              fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
              fontSize: 14,
              fontWeight: 'bold',
            },
            itemStyle: {
              color: '#f87171',
              borderRadius: [8, 8, 0, 0],
              borderWidth: 2,
            },
            data: Object.values(currentStageCounts),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
    };
  }


  fetchServiceOwnerAndCurrentStageMapChartOption(data: IPrivacyData[]): EChartsOption {
    return {
      title: {
        text: 'Pending current stages per service owner',
        subtext: `Pending requests by service owners based on current stages`,
        textStyle: this.getFontBasedStyle(20),
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
        textStyle: this.getFontBasedStyle(14),
      },
      grid: {
        height: '70%',
        top: 'center',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: this.fetchUniqueCurrentStages().filter(d => d !== 'Completed' && d !== 'Rejected'),
        splitArea: {
          show: true,
        },
        axisLabel: this.getFontBasedStyle(12),
      },
      yAxis: {
        type: 'category',
        data: this.serviceMapping.map(d => d.name),
        splitArea: {
          show: true,
        },

        axisLabel: this.getFontBasedStyle(12, 'right')
      },
      visualMap: {
        min: 0,
        max: 15,
        showLabel: true,
        borderMiterLimit: 1,
        calculable: true,
        orient: 'vertical',
        right: '5%',
        bottom: 'center',
        textStyle: this.getFontBasedStyle(12),

        inRange: {
          color: ['#047857', '#facc15', '#b91c1c'],
        },
      },
      series: [
        {
          name: SeriesNames.PendingRequestsByServiceOwnerAndCurrentStage,
          type: 'heatmap',
          data: this.getUniqueServiceOwnersWithCurrentStagesAndPendingRequestCount(data).map(d => [d[0], d[1], d[2]]),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            show: true,
            position: 'inside',
            fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
      ],
    };
  }

  isRequestPending(data: IPrivacyData): boolean {
    return !(this.isRequestCompleted(data) || this.isRequestRejected(data));
  }

  isRequestCompleted(data: IPrivacyData): boolean {
    return data.currentStage === 'Completed';
  }

  isRequestRejected(data: IPrivacyData): boolean {
    return data.currentStage === 'Rejected';
  }

  private getFontBasedStyle(fntSize = 12, align = 'center'): any {
    return {
      fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: fntSize,
      align: align,
    };
  }

  private isOptOutRequest(data: IPrivacyData): boolean {
    return data.requestType === this.saleShareOptOutRequestTypeText || data.requestType === this.rightToLimitUseTypeText;
  }

  private isOptOutStage(data: IPrivacyData): boolean {
    return data.currentStage.includes('OPT-OUT');
  }
}

export enum EChartType {
  Bar = 'bar',
  Pie = 'pie',
  Heatmap = 'heatmap',
}

export enum SeriesNames {
  PendingByServiceOwner = 'Pending requests distribution by Service Owner',
  PendingRequestsSLAStatus = 'Pending requests - SLA status',
  PendingRequestTypeDistribution = 'Pending requests - request type distribution',
  PendingRequestsByCurrentStage = 'Pending requests by current stage',
  PendingRequestsByServiceOwnerAndCurrentStage = 'Pending requests by service owner and current stage',
}

export enum SLAChartLabels {
  MeetsSLA = 'Meets SLA',
  NearingSLA = 'Nearing SLA',
  ExceedsSLA = 'Exceeds SLA',
}
