import { Injectable } from '@angular/core';
import { IPrivacyData } from '@core/models/interfaces/privacy-data';
import { DataService } from '../data/data.service';
import { Observable, tap } from 'rxjs';
import { ECharts, EChartsOption } from 'echarts';
import { IPrivacyRequestStats } from '@app/core/models/interfaces/privacy-request-stats';

@Injectable({
  providedIn: 'root'
})

export class DashboardService {
  saleShareOptOutRequestTypeText = 'Right to opt out of sale or sharing';
  nonDiscrimationRequestTypeText = 'Right to non-discrimination';

  originalData: IPrivacyData[] = [];

  constructor(private dataService: DataService) { }

  getDashboardData(): Observable<IPrivacyData[]> {
    return this.dataService.getPrivacyData().pipe(
      tap(data => this.originalData = data)
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
      allOptOuts: data.filter(d => this.isOptOutRequest(d)).length,
      optOutCompleted: data.filter(d => this.isOptOutRequest(d) && this.isRequestCompleted(d)).length,
      optOutPending: data.filter(d => this.isOptOutRequest(d) && this.isRequestPending(d)).length,
      optOutRejected: data.filter(d => this.isOptOutRequest(d) && this.isRequestRejected(d)).length,
      optOutNearingSLAInAWeek: data.filter(d => this.isOptOutRequest(d) && this.isRequestPending(d) && Number(d.slaDays) > 0 && Number(d.slaDays) < 7).length,
      optOutBreached: data.filter(d => this.isOptOutRequest(d) && this.isRequestPending(d) && Number(d.slaDays) < 0).length
    };
    return totals;
  }

  fetchStateOptions(): { value: string, label: string }[] {
    return this.dataService.getStates()
  }

  fetchServiceOwners(): { value: string, label: string }[] {
    return this.dataService.getServices()
  }

  fetchUniqueRequestTypes(): string[] {
    return this.originalData.map(d => d.requestType).filter((value, index, self) => self.indexOf(value) === index);
  }


  applyDashboardFilters(selectedServiceOwner: string, selectedState: string, selectedRequestType: string, selectedStartDate: Date, selectedEndDate: Date): IPrivacyData[] {
    let filteredData = this.originalData;

    if (selectedServiceOwner && selectedServiceOwner !== 'all') {
      filteredData = this.filterDataByServiceOwner(filteredData, selectedServiceOwner);
    }

    if (selectedState && selectedState !== 'all') {
      filteredData = filteredData.filter(d => d.state === selectedState);
    }

    if (selectedRequestType && selectedRequestType !== 'all') {
      filteredData = filteredData.filter(d => d.requestType === selectedRequestType);
    }

    if (selectedStartDate) {
      filteredData = filteredData.filter(d => new Date(d.requestCreatedDate) >= new Date(selectedStartDate));
    }

    if (selectedEndDate) {
      filteredData = filteredData.filter(d => new Date(d.requestCreatedDate) <= new Date(selectedEndDate));
    }

    return filteredData;
  }

  removeDashboardFilters(selectedServiceOwner: string): IPrivacyData[] {
    let filteredData = this.originalData;

    if (selectedServiceOwner) {
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

  getUniqueServiceOwnersWithRequestTypesAndNonProcessedRequestCount(data: IPrivacyData[]): [requestType: string, serviceOwner: string, count: number][] {
    // Get unique service owners with request types and count and map request type to requestType, service owner to serviceOwner and count to count
    const serviceOwners = data
      .filter(d => d.currentStage !== 'Completed' && d.currentStage !== 'Rejected')
      .map(d => ({ requestType: d.requestType, serviceOwner: d.serviceOwner }))
      .reduce((acc, curr) => {
        const key = `${curr.requestType}-${curr.serviceOwner}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

    const uniqueServiceOwners = Array.from(new Set(data
      .filter(d => d.currentStage !== 'Completed' && d.currentStage !== 'Rejected')
      .map(d => d.serviceOwner)));

    const uniqueRequestTypes = Array.from(new Set(data
      .filter(d => d.currentStage !== 'Completed' && d.currentStage !== 'Rejected')
      .map(d => d.requestType)));

    const result: [string, string, number][] = [];

    uniqueRequestTypes.forEach(requestType => {
      uniqueServiceOwners.forEach(serviceOwner => {
        const key = `${requestType}-${serviceOwner}`;
        const serviceOwnerLabel = this.fetchServiceOwners().find(s => s.value === serviceOwner)?.label || serviceOwner;
        const count = serviceOwners[key] || 0;
        result.push([requestType, serviceOwnerLabel, count]);
      });
    });

    return result;
  }

  fetchSLAComplianceChartOptions(stats: IPrivacyRequestStats): EChartsOption {
    return {
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
          color: ["#047857", "#facc15", "#dc2626"],
          // color: ["rgb(16 185 129)", "rgb(253 224 71)", "rgb(248 113 113)"],
          data: [
            { value: stats.inSLA, name: 'Compliant' },
            { value: stats.nearingSLAInAWeek, name: 'Nearing breach' },
            { value: stats.breached, name: 'Breached' },
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
        subtext: `Request type distribution for non-processed requests`,
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
        data: this.getUniquePendingRequestTypesWithCount(data).map(d => d.name),
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
          data: this.getUniquePendingRequestTypesWithCount(data),
        },
      ],
      animationType: 'scale',
      animationEasing: 'quadraticOut',
      animationDelay: () => Math.random() * 200,
    };
  }

  fetchServiceOwnerRequestTypeHeatMapChartOptions(data: IPrivacyData[]): EChartsOption {
    return {
      title: {
        text: 'Non-processed Request types per Service Owner',
        subtext: `Non-processed Request types per Service Owner for the non-processed requests`,
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
        height: '60%',
        top: 'center',
        containLabel: true,

      },
      xAxis: {
        type: 'category',
        data: this.fetchUniqueRequestTypes(),
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
        data: this.fetchServiceOwners().map(d => d.label),
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
          data: this.getUniqueServiceOwnersWithRequestTypesAndNonProcessedRequestCount(data).map(d => [d[0], d[1], d[2]]),
          label: {
            show: true,
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
  }

  fetchNonProcessedRequestsByCurrentStageBarChartOption(data: IPrivacyData[]): EChartsOption {
    let currentStageCounts = data.filter(d => this.isRequestPending(d)).map(d => d.currentStage).reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    currentStageCounts = Object.entries(currentStageCounts)
      .sort((a, b) => b[1] - a[1])
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as { [key: string]: number });

    return {
      title: {
        text: 'Non-processed Requests by Current Stage',
        subtext: 'Non-processed Requests by Current Stage',
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
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        textStyle: {
          fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 14,
        },
      },
      grid: {
        height: '80%',
        top: '20%',
        bottom: 'center',
        left: 'start',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: Object.keys(currentStageCounts),
        axisLabel: {
          fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 12,
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 12,
        },
      },
      series: [
        {
          name: 'Non-processed Requests',
          type: 'bar',
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(220, 220, 220, 0.8)',
          },
          label: {
            show: true,
            position: 'inside',
            fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
            fontSize: 12,
          },
          data: Object.values(currentStageCounts),
          itemStyle: {
            borderRadius: 2,
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

  private isRequestCompleted(data: IPrivacyData): boolean {
    return data.currentStage === 'Completed';
  }

  private isRequestRejected(data: IPrivacyData): boolean {
    return data.currentStage === 'Rejected';
  }

  private isRequestPending(data: IPrivacyData): boolean {
    return !(this.isRequestCompleted(data) || this.isRequestRejected(data));
  }

  private isOptOutRequest(data: IPrivacyData): boolean {
    return data.requestType === this.saleShareOptOutRequestTypeText || data.requestType === this.nonDiscrimationRequestTypeText;
  }
}
