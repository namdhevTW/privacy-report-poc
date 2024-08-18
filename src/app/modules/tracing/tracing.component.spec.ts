import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TracingComponent } from './tracing.component';

describe('TracingComponent', () => {
  let component: TracingComponent;
  let fixture: ComponentFixture<TracingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TracingComponent]
    });
    fixture = TestBed.createComponent(TracingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display full state', () => {
    const state = 'active';
    const expected = 'Active';
    const result = component.displayFullState(state);
    expect(result).toEqual(expected);
  });

  it('should set column definitions', () => {
    component['setColumnDefs']();
    expect(component.colDefs.length).toBeGreaterThan(0);
  });

  it('should check if user is admin', () => {
    const isAdmin = component['isAdmin']();
    expect(isAdmin).toBeTrue();
  });
});
