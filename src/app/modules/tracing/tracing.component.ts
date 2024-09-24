import { Component, Input, TemplateRef } from '@angular/core';
import { IPrivacyData } from '@app/core/models/interfaces/privacy-data';
import { AuthService } from '@app/core/services/auth/auth.service';
import { DataService } from '@app/core/services/data/data.service';
import { NzTableSortOrder, NzTableSortFn, NzTableFilterList, NzTableFilterFn } from 'ng-zorro-antd/table';
import { exportCSVFromJSON } from 'export-json-to-csv';
import { IServiceMapping } from '@app/core/models/interfaces/service-mapping';
import { NzModalService } from 'ng-zorro-antd/modal';
import { IServiceNotificationEmailDraftInput } from '@app/core/models/interfaces/service-notification-email-draft-input';

@Component({
  selector: 'tracing',
  templateUrl: './tracing.component.html',
  styleUrls: ['./tracing.component.css']
})
export class TracingComponent {
  @Input() dataForModal: IPrivacyData[] = [];
  @Input() displayCols: string[] = ['requestId', 'requestType', 'serviceOwner', 'currentStage', 'state', 'slaDays', 'slaDaysLeft', 'subtaskCreatedDate', 'requestCreatedDate'];
  @Input() pageSizeLimit: number = 10;

  allChecked = false;
  indeterminate = false;
  serviceEmailInput: IServiceNotificationEmailDraftInput[] = [];
  tableData: IPrivacyData[] = [];
  displayedData: readonly IPrivacyData[] = [];

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

  stateOptions: string[] = [];

  private role: string = 'coordinator';
  private serviceOwner: string = '';
  private _selectedRequestServiceDataForEmail: { requestId: string, service: string }[] = [];
  private _availableServices: IServiceMapping[] = [];

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private modalService: NzModalService,
  ) {
    this.stateOptions = this.dataService.getStates();
    this._availableServices = this.dataService.serviceMapping;
  }

  ngOnInit(): void {
    if (this._availableServices.length === 0) {
      this.dataService.getServices().subscribe(
        data => this._availableServices = data
      );
    }
    this.loadTableData();
  }

  ngOnDestroy(): void {
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  ngOnChanges(): void {
    this.loadTableData();
  }

  loadPrivacyTableData() {
    this.dataService.getPrivacyData().subscribe(data => {
      this.tableData = data;

      this.role = this.authService.role;
      if (this.role === 'service-owner') {
        this.serviceOwner = this.authService.serviceOwner;
        this.tableData = data.filter(d => d.serviceOwner === this.serviceOwner);
      }

      this.setColumnDefs();

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

  draftSendEmail(templateRef: TemplateRef<{}>): void {
    this.serviceEmailInput = [];
    this._selectedRequestServiceDataForEmail.forEach(d => {
      this.serviceEmailInput.push({
        serviceLabel: this._availableServices.find(s => s.value === d.service)?.name ?? '',
        emailAddress: this._availableServices.find(s => s.value === d.service)?.emails ?? '',
        requestDetails: this.displayedData
          .filter(td => td.requestId === d.requestId)
          .map(td => ({ requestId: td.requestId, currentStage: td.currentStage, requestDate: td.requestCreatedDate }))
      });
    });

    // flatten the array of requestDetails in serviceEmailInput and keep unique requestIds
    this.serviceEmailInput = this.serviceEmailInput.reduce((acc: IServiceNotificationEmailDraftInput[], curr) => {
      const existingService = acc.find(s => s.serviceLabel === curr.serviceLabel);
      if (existingService) {
        existingService.requestDetails = [...existingService.requestDetails, ...curr.requestDetails];
      } else {
        acc.push(curr);
      }
      return acc;
    }, []);

    let modalRef = this.modalService.create({
      nzTitle: 'Draft and send service notification email',
      nzContent: templateRef,
      nzWidth: '60%',
      nzFooter: null,
      nzMaskClosable: false,
    });

    modalRef.afterClose.subscribe(() => {
      this._selectedRequestServiceDataForEmail = [];
      this.refreshCheckedStatus(true);
    });
  }

  onPageChange(eventData: readonly IPrivacyData[]): void {
    this.displayedData = eventData.filter(d => d.currentStage !== 'Completed' && d.currentStage !== 'Rejected');
    this.refreshCheckedStatus(true);
  }

  onCheckAll(checked: boolean): void {
    this._selectedRequestServiceDataForEmail = checked ? this.displayedData.map(d => ({ requestId: d.requestId, service: d.serviceOwner })) : [];
    this.refreshCheckedStatus();
  }

  getRowsCheckedForSendingEmail(): number {
    return this._selectedRequestServiceDataForEmail.length;
  }

  checkReqIdServiceInEmailSendData(data: IPrivacyData): boolean {
    return this._selectedRequestServiceDataForEmail.some(d => d.requestId === data.requestId && d.service === data.serviceOwner);
  }

  onRowCheck(checked: boolean, data: IPrivacyData): void {
    if (checked) {
      this._selectedRequestServiceDataForEmail.push({ requestId: data.requestId, service: data.serviceOwner });
    } else {
      this._selectedRequestServiceDataForEmail = this._selectedRequestServiceDataForEmail.filter(d => d.requestId !== data.requestId || d.service !== data.serviceOwner);
    }
    this.refreshCheckedStatus();
  }

  getServiceEmailTooltip(service: string): string {
    return `Send email to:\n${this._availableServices.find(s => s.value === service)?.emails ?? ''}`;
  }

  openSendEmailModal(data: IPrivacyData): void {
    //TODO: Implement this method
  }

  isProcessedData(data: IPrivacyData): boolean {
    return data.currentStage === 'Completed' || data.currentStage === 'Rejected';
  }

  isCoordinator(): boolean {
    return this.role === 'coordinator';
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

  private loadTableData() {
    if (this.dataForModal.length > 0) {
      this.tableData = this.dataForModal;
      this.setColumnDefs();
    } else {
      this.loadPrivacyTableData();
    }
  }

  private refreshCheckedStatus(clear = false): void {
    if (clear) {
      this._selectedRequestServiceDataForEmail = [];
      this.allChecked = false,
        this.indeterminate = false
    }
    this.allChecked = this.displayedData.every(data => this._selectedRequestServiceDataForEmail.some(d => d.requestId === data.requestId && d.service === data.serviceOwner));
    this.indeterminate = this.displayedData.some(data => this._selectedRequestServiceDataForEmail.some(d => d.requestId === data.requestId && d.service === data.serviceOwner)) && !this.allChecked;
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
        listOfFilter: this._availableServices.map(s => ({ text: s.name, value: s.value })),
        filterFn: (value: string[], item: IPrivacyData) => value.some(v => item.serviceOwner === v),
        filterMultiple: true,
        showFilter: this.isCoordinator(),
        showSort: true,
        showCol: this.isCoordinator() && this.displayCols.includes('serviceOwner'),
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
        name: 'SLA Days Left',
        value: 'slaDaysLeft',
        sortOrder: null,
        sortFn: (a: IPrivacyData, b: IPrivacyData) => Number(a.slaDaysLeft) - Number(b.slaDaysLeft),
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        showFilter: false,
        showSort: true,
        showCol: this.displayCols.includes('slaDaysLeft'),
        sortDirections: ['ascend', 'descend', null]
      },
      {
        name: 'Subtask created date',
        value: 'subtaskCreatedDate',
        sortOrder: null,
        sortFn: (a: IPrivacyData, b: IPrivacyData) => a.requestCreatedDate.localeCompare(b.requestCreatedDate),
        listOfFilter: [],
        filterFn: null,
        filterMultiple: false,
        showFilter: false,
        showSort: true,
        showCol: this.displayCols.includes('subtaskCreatedDate'),
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
        name: 'State',
        value: 'state',
        sortOrder: null,
        sortFn: (a: IPrivacyData, b: IPrivacyData) => a.state.localeCompare(b.state),
        listOfFilter: this.dataService.getStates().map(s => ({ text: s, value: s })),
        filterFn: (value: string[], item: IPrivacyData) => value.some(v => item.state === v),
        filterMultiple: true,
        showFilter: true,
        showSort: true,
        showCol: this.displayCols.includes('state'),
        sortDirections: ['ascend', 'descend', null]
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
}
