import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxBankDetailsComponent } from './tax-bank-details.component';

describe('TaxBankDetailsComponent', () => {
  let component: TaxBankDetailsComponent;
  let fixture: ComponentFixture<TaxBankDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaxBankDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaxBankDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
