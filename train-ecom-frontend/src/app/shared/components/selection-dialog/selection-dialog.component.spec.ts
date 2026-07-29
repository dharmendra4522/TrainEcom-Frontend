import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../material.module';

import { SelectionDialogComponent } from './selection-dialog.component';

describe('SelectionDialogComponent', () => {
  let component: SelectionDialogComponent;
  let fixture: ComponentFixture<SelectionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectionDialogComponent],
      imports: [MaterialModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { title: 'Select item', items: [], displayKey: 'id' },
        },
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
