import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogData } from '../../../core/models/dialog.model';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NominatimAddress } from '../../../core/models/auth.model';
import { City, Country, ICity, ICountry, IState, State } from 'country-state-city';
import { getFieldError, trimControlValue } from '../../../features/auth/register.utils';

@Component({
  selector: 'app-generic-dialog',
  templateUrl: './generic-dialog.component.html',
  styleUrl: './generic-dialog.component.css',
})
export class GenericDialogComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  dynamicForm!: FormGroup;
  isLoadingLocation = false;
  countries: ICountry[] = Country.getAllCountries();
  states: IState[] = [];
  cities: ICity[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dialogRef: MatDialogRef<GenericDialogComponent>,
  ) {}

  ngOnInit(): void {
    this.buildDynamicForm();
    this.initializeLocationFields();
  }

  private initializeLocationFields(): void {
    if (!this.dynamicForm?.contains('country')) return;

    const countryName = this.dynamicForm.get('country')?.value || 'India';
    this.dynamicForm.get('country')?.setValue(countryName);
    this.loadStates(countryName);

    const stateName = this.dynamicForm.get('state')?.value;
    if (stateName) {
      this.loadCities(countryName, stateName);
    }
  }

  onCountryChange(countryName: string): void {
    this.dynamicForm.get('state')?.reset('');
    this.dynamicForm.get('city')?.reset('');
    this.states = [];
    this.cities = [];
    this.loadStates(countryName);
  }

  onStateChange(stateName: string): void {
    this.dynamicForm.get('city')?.reset('');
    this.cities = [];
    const countryName = this.dynamicForm.get('country')?.value;
    this.loadCities(countryName, stateName);
  }

  private loadStates(countryName: string): void {
    const country = this.countries.find(item => item.name === countryName);
    this.states = country ? State.getStatesOfCountry(country.isoCode) : [];
  }

  private loadCities(countryName: string, stateName: string): void {
    const country = this.countries.find(item => item.name === countryName);
    const state = this.states.find(item => item.name === stateName);
    if (!country || !state) {
      this.cities = [];
      return;
    }
    this.cities = City.getCitiesOfState(country.isoCode, state.isoCode);
  }

  buildDynamicForm(): void {
    const group: Record<string, unknown> = {};
    this.data.fields.forEach((field) => {
      let defaultValue =
        field.value !== undefined
          ? field.value
          : field.type === 'checkbox'
            ? false
            : '';
      let validations = field.validation || [];
      if (field.required) {
        validations = [...validations, Validators.required];
      }
      group[field.key] = [defaultValue, validations];
    });
    this.dynamicForm = this.fb.group(group);
  }

  onSubmit(): void {
    if (this.dynamicForm.valid) {
      this.dialogRef.close(this.dynamicForm.value);
    }
  }

  getFieldError(fieldKey: string, fieldLabel: string): string {
    return getFieldError(this.dynamicForm.get(fieldKey), fieldLabel);
  }

  trimControlValue(fieldKey: string): void {
    trimControlValue(this.dynamicForm.get(fieldKey));
  }

  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.notificationService.showError('Geolocation is not supported by your browser.');
      return;
    }

    this.isLoadingLocation = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.authService
          .getCurrentAddress(position.coords.latitude, position.coords.longitude)
          .subscribe({
            next: (response) => {
              this.patchLocationAddress(response.address);
              this.isLoadingLocation = false;
            },
            error: () => {
              this.isLoadingLocation = false;
              this.notificationService.showError('Failed to fetch current address.');
            },
          });
      },
      () => {
        this.isLoadingLocation = false;
        this.notificationService.showError('Unable to access current location.');
      },
    );
  }

  private patchLocationAddress(address: NominatimAddress): void {
    const addressLine1 = [
      address.house_number,
      address.road,
      address.industrial,
      address.suburb,
    ]
      .filter((value): value is string => !!value)
      .join(', ');
    const city = address.city || address.town || address.village || address.hamlet || '';
    const country = address.country || 'India';
    const state = address.state || '';

    const locationValues: Record<string, string> = {
      addressLine1,
      city,
      country,
      state,
      postalCode: address.postcode || '',
    };

    Object.entries(locationValues).forEach(([key, value]) => {
      if (this.dynamicForm.contains(key)) {
        this.dynamicForm.get(key)?.setValue(value);
        this.dynamicForm.get(key)?.markAsDirty();
        this.dynamicForm.get(key)?.markAsTouched();
      }
    });

    this.loadStates(country);
    this.loadCities(country, state);
  }
}
