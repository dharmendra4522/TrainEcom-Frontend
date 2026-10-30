import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { City, ICity, ICountry, IState, State } from 'country-state-city';
import { getFieldError, trimControlValue } from '../../../register.utils';
import { AuthService } from '../../../../../core/services/auth.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { AutoFilledAddress, NominatimAddress } from '../../../../../core/models/auth.model';

@Component({
  selector: 'app-address-details',
  templateUrl: './address-details.component.html',
  styleUrl: './address-details.component.css'
})
export class AddressDetailsComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  @Input() registerForm!: FormGroup;
  @Input() countries: ICountry[] = [];
  @Input() states: IState[] = [];
  @Input() cities: ICity[] = [];
  @Input() isStep3Valid: boolean = false;
  @Input() isEditMode: boolean = false;

  @Output() countryChange = new EventEmitter<MatSelectChange>();
  @Output() stateChange = new EventEmitter<MatSelectChange>();
  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  isLoading: boolean = false;

  onCountryChange(event: MatSelectChange): void {
    this.countryChange.emit(event);
  }

  onStateChange(event: MatSelectChange): void {
    this.stateChange.emit(event);
  }

  onPrev(): void {
    this.prev.emit();
  }

  onNext(): void {
    this.next.emit();
  }

  getErrorMessage(controlName: string, label: string): string {
    const control = this.registerForm.get(controlName);
    return getFieldError(control, label);
  }

  onBlurTrim(contronName: string): void {
    const control = this.registerForm.get(contronName);
    trimControlValue(control);
  }

  // handle current location fetching
  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.notificationService.showError('Geolocation is not supported by your browser.');
      return;
    }
    this.isLoading = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        this.fetchCurrentAddress(latitude, longitude);
      },
      () => {
        this.isLoading = false;
        this.notificationService.showError('Unable to access current location.');
      }
    );
  }

  //handle map the address response
  private mapAddressResponse(address: NominatimAddress): AutoFilledAddress {
    return {
      addressLine1: [address.house_number, address.road, address.industrial, address.suburb].filter(Boolean).join(', '),
      country: address.country ?? '',
      state: address.state ?? '',
      city: address.city || '',
      postalCode: address.postcode ?? ''
    }
  }

  // load the states and cities based on the selected country and state
  private loadLocationOptions(country: string, state: string): void {
    const selectedCountry = this.countries.find(c => c.name === country);
    if (selectedCountry) {
      this.states = State.getStatesOfCountry(selectedCountry.isoCode);
    }
    const selectedState = this.states.find(
      s => s.name === state
    );
    if (selectedCountry && selectedState) {
      this.cities = City.getCitiesOfState(
        selectedCountry.isoCode,
        selectedState.isoCode
      );
    }
  }

  // handle fetch address from nomination api 
  private fetchCurrentAddress(latitude: number, longitude: number): void {
    this.authService.getCurrentAddress(latitude, longitude).subscribe({
      next: (response) => {
        this.isLoading = false;
        const addressData = this.mapAddressResponse(response.address);
        this.patchAddressForm(addressData);
      },
      error: () => {
        this.notificationService.showError('Failed to fetch current address.');
        this.isLoading = false;
      }
    });
  }

  // handle patching the form with the fetched address data
  private patchAddressForm(data: AutoFilledAddress): void {
    this.loadLocationOptions(
      data.country,
      data.state
    );
    this.registerForm.patchValue({
      addressLine1: data.addressLine1,
      country: data.country,
      state: data.state,
      city: data.city,
      postalCode: data.postalCode
    });
    this.registerForm.get('country')?.markAsDirty();
    this.registerForm.get('state')?.markAsDirty();
    this.registerForm.get('city')?.markAsDirty();
  }

}
