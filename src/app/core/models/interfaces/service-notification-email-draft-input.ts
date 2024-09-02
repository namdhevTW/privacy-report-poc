export interface IServiceNotificationEmailDraftInput {
  emailAddress: string;
  serviceLabel: string;
  requestDetails: { requestId: string, currentStage: string, requestDate: string }[];
}
