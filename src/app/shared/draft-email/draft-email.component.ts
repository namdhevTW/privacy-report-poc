import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IServiceNotificationEmailDraftInput } from '@app/core/models/interfaces/service-notification-email-draft-input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { QuillModules } from 'ngx-quill';
import { concatMap } from 'rxjs';

@Component({
  selector: 'draft-email',
  templateUrl: './draft-email.component.html',
  styleUrl: './draft-email.component.css'
})
export class DraftEmailComponent {
  @Input() serviceEmailInput: IServiceNotificationEmailDraftInput[] = [];

  selectedServiceInput: IServiceNotificationEmailDraftInput = { emailAddress: '', serviceLabel: '', requestDetails: [] };
  draftedEmailContent: string = '';
  modules: QuillModules = {};
  showLoading = false;

  constructor(private messageService: NzMessageService, private modalService: NzModalService) { }


  ngOnInit(): void {
    this.selectedServiceInput = this.serviceEmailInput[0];
    this.draftEmailContent();
    this.modules = {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        ['clean'],
        ['link', 'image']
      ],
    };
  }

  onServiceDraftSelectionChange(): void {
    this.draftEmailContent();
  }

  sendDraftedEmail(): void {
    this.showLoading = true;
    this.messageService.loading('Sending the drafted email ...', { nzDuration: 2500 }).onClose!.subscribe(() => {
      this.messageService.success(`Notified sent to all the <b>${this.selectedServiceInput.serviceLabel}</b> emails`, { nzDuration: 3500 });
      if (this.serviceEmailInput.length > 1) {
        this.serviceEmailInput = this.serviceEmailInput.filter(service => service.serviceLabel !== this.selectedServiceInput.serviceLabel);
        this.selectedServiceInput = this.serviceEmailInput[0];
        this.draftEmailContent();
      } else {
        this.messageService.success('All emails sent successfully', { nzDuration: 3000 });
        this.modalService.openModals[0].close();
      }
      this.showLoading = false;
    });
  }

  private draftEmailContent(): void {
    this.draftedEmailContent = `Hi, ${this.selectedServiceInput.serviceLabel} team,
    <br>
    <br>The following requests are pending action from your end. Please review and take the necessary action.
    <br>
    <br>
    <table>
      <tr>
        <td style="font-weight:700">Request ID</th>
        <td style="font-weight:700">Current Stage</th>
        <td style="font-weight:700">Request Date</th>
      </tr>
      ${this.selectedServiceInput.requestDetails.map(request => `
        <tr>
          <td>${request.requestId}</td>
          <td>${request.currentStage}</td>
          <td>${new Date(request.requestDate).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    }).replace(/ /g, '-')}</td>
        </tr>
      `).join('')}
    </table>
    <br>
    <br>
    Regards,
    <br>
    Privacy office`;
  }

}
