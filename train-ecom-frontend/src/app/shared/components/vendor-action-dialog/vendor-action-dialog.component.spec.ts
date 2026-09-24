import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorActionDialogComponent } from './vendor-action-dialog.component';

describe('VendorActionDialogComponent', () => {
  let component: VendorActionDialogComponent;
  let fixture: ComponentFixture<VendorActionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VendorActionDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorActionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
