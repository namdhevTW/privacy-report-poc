import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IServiceNotificationEmailDraftInput } from '@app/core/models/interfaces/service-notification-email-draft-input';

@Component({
  selector: 'app-draft-email',
  templateUrl: './draft-email.component.html',
  styleUrl: './draft-email.component.css'
})
export class DraftEmailComponent {
  @Input() serviceEmailInput: IServiceNotificationEmailDraftInput[] = [];
  @Output() draftedEmailPerService: EventEmitter<{ emailAddress: string, serviceLabel: string, requestId: string, emailContent: string }> = new EventEmitter<{ emailAddress: string, serviceLabel: string, requestId: string, emailContent: string }>();

  selectedServiceInput: IServiceNotificationEmailDraftInput = { emailAddress: '', serviceLabel: '', requestDetails: [] };
  draftedEmailContent: string = '';

  ngOnInit(): void {
    this.selectedServiceInput = this.serviceEmailInput[0];
    this.draftEmailContent();
  }

  onServiceDraftSelectionChange(): void {
    this.draftEmailContent();
  }


  private draftEmailContent(): void {
    this.draftedEmailContent = `
    Hi ${this.selectedServiceInput.serviceLabel} team,
    <br>
    <br>
    The following requests are pending action from your end. Please review and take the necessary action.
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
