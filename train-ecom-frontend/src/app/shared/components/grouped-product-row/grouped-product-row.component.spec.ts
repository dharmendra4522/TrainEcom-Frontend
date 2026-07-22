import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupedProductRowComponent } from './grouped-product-row.component';

describe('GroupedProductRowComponent', () => {
  let component: GroupedProductRowComponent;
  let fixture: ComponentFixture<GroupedProductRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GroupedProductRowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupedProductRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
