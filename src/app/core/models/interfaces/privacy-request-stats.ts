export interface IPrivacyRequestStats {
  all: number;
  completed: number;
  pending: number;
  rejected: number;
  meetsSLA: number;
  nearingSLA: number;
  exceededSLA: number;
}
