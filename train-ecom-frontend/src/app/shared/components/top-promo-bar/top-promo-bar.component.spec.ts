import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopPromoBarComponent } from './top-promo-bar.component';

describe('TopPromoBarComponent', () => {
  let component: TopPromoBarComponent;
  let fixture: ComponentFixture<TopPromoBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TopPromoBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopPromoBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
