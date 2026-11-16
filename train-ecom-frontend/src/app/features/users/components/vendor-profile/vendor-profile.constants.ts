import { DocumentType, VendorTabConfig } from "../../../../core/models/vendor.model";


export const VENDOR_PROFILE_TABS: VendorTabConfig[] = [
  {
    label: 'General',
    fields: [
      { label: 'Full Name', key: 'name' },
      { label: 'Email Address', key: 'email' },
      { label: 'Phone Number', key: 'phoneNumber' }
    ]
  },
  {
    label: 'Business',
    fields: [
      { label: 'Business Name', key: 'bussinessName' },
      { label: 'Display Name', key: 'storeName' },
      { label: 'Business Description', key: 'bussinessDescription' },
      { label: 'Categories', key: 'categories', isList: true }
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
      { label: 'Account Holder Name', key: 'accountHolderName' },
      { label: 'Bank Account Number', key: 'bankAccountNumber' },
      { label: 'IFSC Code', key: 'ifscCode' }
    ]
  },
  {
    label: 'Documents',
    fields: [
      {
        label: 'Business Registration Document',
        key: 'doc1',
        isLink: true,
        docType: DocumentType.BussinessDocument
      },
      { label: 'GST Document', key: 'doc2', isLink: true, docType: DocumentType.GSTDocument },
      {
        label: 'Business Logo',
        key: 'doc3',
        isLink: true,
        docType: DocumentType.Logo
      }
    ]
  }
];
