import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraftEmailComponent } from './draft-email.component';

describe('DraftEmailComponent', () => {
  let component: DraftEmailComponent;
  let fixture: ComponentFixture<DraftEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DraftEmailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DraftEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
