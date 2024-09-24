export enum SLAChartLabels {
  MeetsSLA = 'Meets SLA',
  NearingSLA = 'Nearing SLA',
  ExceedsSLA = 'Exceeds SLA',
}

export enum SeriesNames {
  PendingByServiceOwner = 'Pending requests distribution by Service Owner',
  PendingRequestsSLAStatus = 'Pending requests - SLA status',
  PendingRequestsAgingForServiceOwner = 'Pending requests aging for service owner',
  PendingRequestTypeDistribution = 'Pending requests - request type distribution',
  PendingRequestsByCurrentStage = 'Pending requests by current stage',
  PendingRequestsByServiceOwnerAndCurrentStage = 'Pending requests by service owner and current stage',
}


export enum EChartType {
  Bar = 'bar',
  Pie = 'pie',
  Heatmap = 'heatmap',
}

export enum SLAStatusColors {
  MeetsSLA = '#15803d',
  NearingSLA = '#fbbf24',
  ExceedsSLA = '#b91c1c',
}
