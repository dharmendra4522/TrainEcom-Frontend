import { UpdateProfilePayload } from "../../../../core/models/user.model";


export function createVendorFormData(payload: UpdateProfilePayload): FormData {
    const formData = new FormData;
    formData.append('Name', payload.name);
    formData.append('PhoneNumber', payload.phoneNumber);
    if (payload.oldPassword) {
        formData.append('OldPassword', payload.oldPassword);
    }
    if (payload.newPassword) {
        formData.append('NewPassword', payload.newPassword);
    }
    if (payload.confirmPassword) {
        formData.append('ConfirmPassword', payload.confirmPassword);
    }
    const business = payload.bussinessDetails;
    formData.append('BussinessDetails.BussinessDescription', business?.bussinessDescription ?? '');
    formData.append('BussinessDetails.StoreName', business?.storeName ?? '');
    formData.append('BussinessDetails.AddressLine1', business?.addressLine1 ?? '');
    formData.append('BussinessDetails.AddressLine2', business?.addressLine2 ?? '');
    formData.append('BussinessDetails.City', business?.city ?? '');
    formData.append('BussinessDetails.State', business?.state ?? '');
    formData.append('BussinessDetails.Country', business?.country ?? '');
    formData.append('BussinessDetails.PostalCode', business?.postalCode ?? '');
    if (payload.bussinessDetails?.bankAccountNumber) {
        formData.append('BussinessDetails.BankAccountNumber', business?.bankAccountNumber ?? '');
    }
    if (payload.bussinessDetails?.ifscCode) {
        formData.append('BussinessDetails.IFSCCode', business?.ifscCode ?? '');
    }

    business?.newCategoryIds?.forEach((catId) => {
        formData.append('BussinessDetails.newCategoryIds', String(catId))
    });

    if (payload.bussinessDetails?.gstDocument instanceof File) {
        formData.append('BussinessDetails.GSTDocument', business?.gstDocument ?? '');
    }
    if (payload.bussinessDetails?.businessDocument instanceof File) {
        formData.append('BussinessDetails.BussinessDocument', business?.businessDocument ?? '');
    }
    if (payload.bussinessDetails?.businessLogo instanceof File) {
        formData.append('BussinessDetails.BussinessLogo', business?.businessLogo ?? '');
    }
    return formData;

}