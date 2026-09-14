import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorBusinessDetailsComponent } from './vendor-business-details.component';

describe('VendorBusinessDetailsComponent', () => {
  let component: VendorBusinessDetailsComponent;
  let fixture: ComponentFixture<VendorBusinessDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VendorBusinessDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorBusinessDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
