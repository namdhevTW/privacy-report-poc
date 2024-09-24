import { TestBed } from '@angular/core/testing';

import { DashboardNgxchartsService } from './dashboard-ngxcharts.service';

describe('DashboardNgxchartsService', () => {
  let service: DashboardNgxchartsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardNgxchartsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
