export interface IPrivacyRequestStats {
  all: number;
  completed: number;
  pending: number;
  rejected: number;
  inSLA: number;
  nearingSLAInAWeek: number;
  breached: number;
  allOptOuts: number;
  optOutCompleted: number;
  optOutPending: number;
  optOutRejected: number;
  optOutNearingSLAInAWeek: number;
  optOutBreached: number;
}
