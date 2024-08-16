import { Component } from '@angular/core';
import { IPrivacyData } from '@app/core/models/interfaces/privacy-data';
import { DataService } from '@app/core/services/data/data.service';
import { NzTableSortOrder, NzTableSortFn, NzTableFilterList, NzTableFilterFn } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-tracing',
  templateUrl: './tracing.component.html',
  styleUrls: ['./tracing.component.css']
})
export class TracingComponent {
  tableData: IPrivacyData[] = [];
  colDefs: {
    name: string;
    sortOrder: NzTableSortOrder | null;
    sortFn: NzTableSortFn<IPrivacyData> | null;
    listOfFilter: NzTableFilterList;
    filterFn: NzTableFilterFn<IPrivacyData> | null;
    filterMultiple: boolean;
    showFilter: boolean;
    sortDirections: NzTableSortOrder[];
  }[] = [
      {
        name: 'Request ID',
        sortOrder: null,
        sortFn: (a: IPrivacyData, b: IPrivacyData) => a.requestId.localeCompare(b.requestId),
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        showFilter: false,
        sortDirections: ['ascend', 'descend', null]
      },
      {
        name: 'Request Type',
        sortOrder: null,
        sortFn: (a: IPrivacyData, b: IPrivacyData) => a.requestType.localeCompare(b.requestType),
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        showFilter: false,
        sortDirections: ['ascend', 'descend', null]
      },
      {
        name: 'Current stage',
        sortOrder: null,
        sortFn: (a: IPrivacyData, b: IPrivacyData) => a.currentStage.localeCompare(b.currentStage),
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        showFilter: false,
        sortDirections: ['ascend', 'descend', null]
      },
      {
        name: 'Service',
        sortOrder: null,
        sortFn: (a: IPrivacyData, b: IPrivacyData) => a.serviceOwner.localeCompare(b.serviceOwner),
        listOfFilter: this.dataService.getServices().map(s => ({ text: s.label, value: s.value })),
        filterFn: (value: string[], item: IPrivacyData) => value.some(v => item.serviceOwner === v),
        filterMultiple: true,
        showFilter: true,
        sortDirections: ['ascend', 'descend', null]
      },
      {
        name: 'State',
        sortOrder: null,
        sortFn: (a: IPrivacyData, b: IPrivacyData) => a.state.localeCompare(b.state),
        listOfFilter: this.dataService.getStates().map(s => ({ text: s.label, value: s.value })),
        filterFn: (value: string[], item: IPrivacyData) => value.some(v => item.state === v),
        filterMultiple: true,
        showFilter: true,
        sortDirections: ['ascend', 'descend', null]
      },
      {
        name: 'SLA Days',
        sortOrder: null,
        sortFn: (a: IPrivacyData, b: IPrivacyData) => Number(a.slaDays) - Number(b.slaDays),
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        showFilter: false,
        sortDirections: ['ascend', 'descend', null]
      },
      {
        name: 'Request created date',
        sortOrder: null,
        sortFn: (a: IPrivacyData, b: IPrivacyData) => a.requestCreatedDate.localeCompare(b.requestCreatedDate),
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        showFilter: false,
        sortDirections: ['ascend', 'descend', null]
      },
      {
        name: 'Request completed date',
        sortOrder: null,
        sortFn: (a: IPrivacyData, b: IPrivacyData) => a.requestCompletedDate.localeCompare(b.requestCompletedDate),
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        showFilter: false,
        sortDirections: ['ascend', 'descend ', null]
      }
    ];

  stateOptions: { value: string, label: string }[] = [];

  constructor(private dataService: DataService) {
    this.stateOptions = this.dataService.getStates();
  }


  ngOnInit(): void {
    this.dataService.getPrivacyData().subscribe(data => {
      this.tableData = data;
    });
  }

  displayFullState(state: string): string {
    return this.stateOptions.find(s => s.value === state)?.label || '';
  }
}
