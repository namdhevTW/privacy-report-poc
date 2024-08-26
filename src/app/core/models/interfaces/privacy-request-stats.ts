export interface IPrivacyRequestStats {
  all: number;
  completed: number;
  pending: number;
  rejected: number;
  inSLA: number;
  nearingSLAInAWeek: number;
  breached: number;
}
