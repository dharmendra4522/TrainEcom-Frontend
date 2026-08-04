import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminOrderStatusDialogComponent } from './admin-order-status-dialog.component';

describe('AdminOrderStatusDialogComponent', () => {
  let component: AdminOrderStatusDialogComponent;
  let fixture: ComponentFixture<AdminOrderStatusDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminOrderStatusDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminOrderStatusDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
