import { UpdateProfilePayload } from "../../../../core/models/user.model";

export function createVendorFormData(payload: Partial<UpdateProfilePayload>): FormData {
  const formData = new FormData();

  if (payload.name !== undefined && payload.name !== null) {
    formData.append('Name', payload.name);
  }
  if (payload.phoneNumber !== undefined && payload.phoneNumber !== null) {
    formData.append('PhoneNumber', payload.phoneNumber);
  }
  if (payload.oldPassword !== undefined && payload.oldPassword !== null) {
    formData.append('OldPassword', payload.oldPassword);
  }
  if (payload.newPassword !== undefined && payload.newPassword !== null) {
    formData.append('NewPassword', payload.newPassword);
  }
  if (payload.confirmPassword !== undefined && payload.confirmPassword !== null) {
    formData.append('ConfirmPassword', payload.confirmPassword);
  }

  const business = payload.bussinessDetails;
  if (business) {
    if (business.bussinessDescription !== undefined && business.bussinessDescription !== null) {
      formData.append('BussinessDetails.BussinessDescription', business.bussinessDescription);
    }
    if (business.storeName !== undefined && business.storeName !== null) {
      formData.append('BussinessDetails.StoreName', business.storeName);
    }
    if (business.addressLine1 !== undefined && business.addressLine1 !== null) {
      formData.append('BussinessDetails.AddressLine1', business.addressLine1);
    }
    if (business.addressLine2 !== undefined && business.addressLine2 !== null) {
      formData.append('BussinessDetails.AddressLine2', business.addressLine2);
    }
    if (business.city !== undefined && business.city !== null) {
      formData.append('BussinessDetails.City', business.city);
    }
    if (business.state !== undefined && business.state !== null) {
      formData.append('BussinessDetails.State', business.state);
    }
    if (business.country !== undefined && business.country !== null) {
      formData.append('BussinessDetails.Country', business.country);
    }
    if (business.postalCode !== undefined && business.postalCode !== null) {
      formData.append('BussinessDetails.PostalCode', business.postalCode);
    }
    if (business.bankAccountNumber !== undefined && business.bankAccountNumber !== null) {
      formData.append('BussinessDetails.BankAccountNumber', business.bankAccountNumber);
    }
    if (business.ifscCode !== undefined && business.ifscCode !== null) {
      formData.append('BussinessDetails.IFSCCode', business.ifscCode);
    }
    if (business.newCategoryIds && business.newCategoryIds.length > 0) {
      business.newCategoryIds.forEach((catId) => {
        formData.append('BussinessDetails.newCategoryIds', String(catId));
      });
    }
    if (business.gstDocument instanceof File) {
      formData.append('BussinessDetails.GSTDocument', business.gstDocument);
    }
    if (business.businessDocument instanceof File) {
      formData.append('BussinessDetails.BussinessDocument', business.businessDocument);
    }
    if (business.businessLogo instanceof File) {
      formData.append('BussinessDetails.BussinessLogo', business.businessLogo);
    }
  }
  if (payload.requestedMessage !== undefined && payload.requestedMessage !== null) {
    formData.append('RequestMessage', payload.requestedMessage);
  }

  return formData;
}