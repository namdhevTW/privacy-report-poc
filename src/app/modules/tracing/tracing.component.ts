import { Component, Input } from '@angular/core';
import { IPrivacyData } from '@app/core/models/interfaces/privacy-data';
import { AuthService } from '@app/core/services/auth/auth.service';
import { DataService } from '@app/core/services/data/data.service';
import { NzTableSortOrder, NzTableSortFn, NzTableFilterList, NzTableFilterFn } from 'ng-zorro-antd/table';
import { exportCSVFromJSON } from 'export-json-to-csv'

@Component({
  selector: 'app-tracing',
  templateUrl: './tracing.component.html',
  styleUrls: ['./tracing.component.css']
})
export class TracingComponent {
  @Input() dataForModal: IPrivacyData[] = [];
  @Input() displayCols: string[] = ['requestId', 'requestType', 'serviceOwner', 'currentStage', 'state', 'slaDays', 'requestCreatedDate', 'requestCompletedDate'];

  pageSizeLimit: number = 5;
  tableData: IPrivacyData[] = [];
  colDefs: {
    name: string;
    value: string;
    sortOrder: NzTableSortOrder | null;
    sortFn: NzTableSortFn<IPrivacyData> | null;
    listOfFilter: NzTableFilterList;
    filterFn: NzTableFilterFn<IPrivacyData> | null;
    filterMultiple: boolean;
    showFilter: boolean;
    showSort: boolean;
    showCol: boolean;
    sortDirections: NzTableSortOrder[];
  }[] = [];

  stateOptions: { value: string, label: string }[] = [];

  private role: string = 'admin';
  private serviceOwner: string = '';

  constructor(private dataService: DataService, private authService: AuthService) {
    this.stateOptions = this.dataService.getStates();
  }

  ngOnInit(): void {
    this.loadTableData();
  }

  ngOnChanges(): void {
    this.loadTableData();
  }

  displayFullState(state: string): string {
    return this.stateOptions.find(s => s.value === state)?.label ?? '';
  }

  private loadTableData() {
    if (this.dataForModal.length > 0) {
      this.tableData = this.dataForModal;
      this.setColumnDefs();
    } else {
      this.dataService.getPrivacyData().subscribe(data => {
        this.tableData = data;

        this.role = this.authService.role;
        if (this.role === 'service-owner') {
          this.serviceOwner = this.authService.serviceOwner;
          this.tableData = data.filter(d => d.serviceOwner === this.serviceOwner);
        }

        this.setColumnDefs();
        this.pageSizeLimit = 10;

        this.authService.roleChangeSubject.subscribe(role => {
          this.role = role;
          if (this.role === 'service-owner') {
            this.serviceOwner = this.authService.serviceOwner;
            this.tableData = data.filter(d => d.serviceOwner === this.serviceOwner);
          } else {
            this.serviceOwner = '';
            this.tableData = data;
          }
          this.setColumnDefs();
        });
        this.authService.serviceOwnerChangeSubject.subscribe(serviceOwner => {
          this.serviceOwner = serviceOwner;
          this.tableData = data.filter(d => d.serviceOwner === this.serviceOwner);
          this.setColumnDefs();
        });
      });
    }
  }

  private setColumnDefs(): void {
    this.colDefs = [
      {
        name: 'Request ID',
        value: 'requestId',
        sortOrder: null,
        sortFn: (a: IPrivacyData, b: IPrivacyData) => a.requestId.localeCompare(b.requestId),
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        showFilter: false,
        showSort: true,
        showCol: this.displayCols.includes('requestId'),
        sortDirections: ['ascend', 'descend', null],
      },
      {
        name: 'Request Type',
        value: 'requestType',
        sortOrder: null,
        sortFn: (a: IPrivacyData, b: IPrivacyData) => a.requestType.localeCompare(b.requestType),
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        showFilter: false,
        showSort: true,
        showCol: this.displayCols.includes('requestType'),
        sortDirections: ['ascend', 'descend', null],
      },
      {
        name: 'Current stage',
        value: 'currentStage',
        sortOrder: null,
        sortFn: (a: IPrivacyData, b: IPrivacyData) => a.currentStage.localeCompare(b.currentStage),
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        showFilter: false,
        showSort: true,
        showCol: this.displayCols.includes('currentStage'),
        sortDirections: ['ascend', 'descend', null]
      },
      {
        name: 'Service',
        value: 'serviceOwner',
        sortOrder: null,
        sortFn: (a: IPrivacyData, b: IPrivacyData) => a.serviceOwner.localeCompare(b.serviceOwner),
        listOfFilter: this.dataService.getServices().map(s => ({ text: s.label, value: s.value })),
        filterFn: (value: string[], item: IPrivacyData) => value.some(v => item.serviceOwner === v),
        filterMultiple: true,
        showFilter: this.isAdmin(),
        showSort: true,
        showCol: this.isAdmin() && this.displayCols.includes('serviceOwner'),
        sortDirections: ['ascend', 'descend', null]
      },
      {
        name: 'State',
        value: 'state',
        sortOrder: null,
        sortFn: (a: IPrivacyData, b: IPrivacyData) => a.state.localeCompare(b.state),
        listOfFilter: this.dataService.getStates().map(s => ({ text: s.label, value: s.value })),
        filterFn: (value: string[], item: IPrivacyData) => value.some(v => item.state === v),
        filterMultiple: true,
        showFilter: true,
        showSort: true,
        showCol: this.displayCols.includes('state'),
        sortDirections: ['ascend', 'descend', null]
      },
      {
        name: 'SLA Days',
        value: 'slaDays',
        sortOrder: null,
        sortFn: (a: IPrivacyData, b: IPrivacyData) => Number(a.slaDays) - Number(b.slaDays),
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        showFilter: false,
        showSort: true,
        showCol: this.displayCols.includes('slaDays'),
        sortDirections: ['ascend', 'descend', null]
      },
      {
        name: 'Request created date',
        value: 'requestCreatedDate',
        sortOrder: null,
        sortFn: (a: IPrivacyData, b: IPrivacyData) => a.requestCreatedDate.localeCompare(b.requestCreatedDate),
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        showFilter: false,
        showSort: true,
        showCol: this.displayCols.includes('requestCreatedDate'),
        sortDirections: ['ascend', 'descend', null]
      },
      {
        name: 'Request completed date',
        value: 'requestCompletedDate',
        sortOrder: null,
        sortFn: (a: IPrivacyData, b: IPrivacyData) => a.requestCompletedDate.localeCompare(b.requestCompletedDate),
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        showFilter: false,
        showSort: true,
        showCol: this.displayCols.includes('requestCompletedDate'),
        sortDirections: ['ascend', 'descend ', null]
      }
    ];

    if (this.dataForModal.length > 0) {
      this.colDefs = this.colDefs.map(col => {
        return {
          ...col,
          showFilter: false,
        }
      })

    }
  }

  exportDataAsCSV(): void {
    exportCSVFromJSON({
      data: this.tableData,
      fileName: 'privacy-data',
      headers: this.colDefs.filter(c => c.showCol).map(c => c.name),
      keys: this.colDefs.filter(c => c.showCol).map(c => c.value)
    });
  }

  isColumnVisible(colName: string): boolean {
    return this.colDefs.find(c => c.value === colName)?.showCol ?? false;
  }

  private isAdmin(): boolean {
    return this.role === 'admin';
  }
}
