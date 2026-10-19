export interface ProfileFieldConfig {
  label: string;
  key: string;
  isList?: boolean;
  isLink?: boolean;
  docType?: number;
  reviewHint?: string;
}

export interface VendorTabConfig {
  label: string;
  fields: ProfileFieldConfig[];
}

export const VENDOR_PROFILE_TABS: VendorTabConfig[] = [
  {
    label: 'General',
    fields: [
      { label: 'Full Name', key: 'name' },
      { label: 'Email Address', key: 'email' },
      { label: 'Phone Number', key: 'phoneNumber', reviewHint: 'Your Number is under review' }
    ]
  },
  {
    label: 'Business',
    fields: [
      { label: 'Business Name', key: 'bussinessName' },
      { label: 'Display Name', key: 'storeName', reviewHint: 'Your new Display name is under review' },
      { label: 'Business Description', key: 'bussinessDescription' },
      { label: 'Categories', key: 'categories', isList: true, reviewHint: 'Your new categories is under review' }
    ]
  },
  {
    label: 'Address',
    fields: [
      { label: 'Address Line 1', key: 'addressLine1' },
      { label: 'Address Line 2', key: 'addressLine2' },
      { label: 'City', key: 'city' },
      { label: 'State', key: 'state' },
      { label: 'Country', key: 'country' },
      { label: 'Postal Code', key: 'postalCode' }
    ]
  },
  {
    label: 'Account & Tax',
    fields: [
      { label: 'GSTIN', key: 'gstin' },
      { label: 'PAN Number', key: 'pan' },
      { label: 'Account Holder Name', key: 'accountHolderName', reviewHint: 'New Account Holder name is under review' },
      { label: 'Bank Account Number', key: 'bankAccountNumber', reviewHint: 'New Account Number is under review' },
      { label: 'IFSC Code', key: 'ifscCode', reviewHint: 'New Ifsc code is under review' }
    ]
  },
  {
    label: 'Documents',
    fields: [
      {
        label: 'Business Registration Document',
        key: 'doc1',
        isLink: true,
        docType: 1,
        reviewHint: 'Your new business Doc is under review'
      },
      { label: 'GST Document', key: 'doc2', isLink: true, docType: 2, reviewHint: 'Your new GST Doc is under review' },
      {
        label: 'Business Logo / Other Document',
        key: 'doc3',
        isLink: true,
        docType: 3,
        reviewHint: 'Your new business logo in under review'
      }
    ]
  }
];
