/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** The `Iterable` scalar type represents an array or a Traversable with any kind of data. */
  Iterable: { input: any; output: any; }
};

export type Barcode = Node & {
  __typename?: 'Barcode';
  _id: Scalars['Int']['output'];
  barcode: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  item?: Maybe<Product>;
  measurement?: Maybe<Scalars['String']['output']>;
  price: Scalars['String']['output'];
  unit?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  usages?: Maybe<Scalars['Int']['output']>;
  used?: Maybe<Scalars['Int']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
  variant?: Maybe<ProductVariant>;
};

/** Cursor connection for Barcode. */
export type BarcodeCursorConnection = {
  __typename?: 'BarcodeCursorConnection';
  edges?: Maybe<Array<Maybe<BarcodeEdge>>>;
  pageInfo: BarcodePageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of Barcode. */
export type BarcodeEdge = {
  __typename?: 'BarcodeEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Barcode>;
};

/** Information about the current page. */
export type BarcodePageInfo = {
  __typename?: 'BarcodePageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Brand = Node & {
  __typename?: 'Brand';
  _id: Scalars['Int']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  stores?: Maybe<StoreCursorConnection>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
};


export type BrandStoresArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<StoreFilter_Order>>>;
};

/** Cursor connection for Brand. */
export type BrandCursorConnection = {
  __typename?: 'BrandCursorConnection';
  edges?: Maybe<Array<Maybe<BrandEdge>>>;
  pageInfo: BrandPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of Brand. */
export type BrandEdge = {
  __typename?: 'BrandEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Brand>;
};

export type BrandFilter_Order = {
  name?: InputMaybe<Scalars['String']['input']>;
};

/** Information about the current page. */
export type BrandPageInfo = {
  __typename?: 'BrandPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Category = Node & {
  __typename?: 'Category';
  _id: Scalars['Int']['output'];
  children?: Maybe<CategoryCursorConnection>;
  createdAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  parent?: Maybe<Category>;
  stores?: Maybe<StoreCursorConnection>;
  type?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
};


export type CategoryChildrenArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<CategoryFilter_Order>>>;
  type?: InputMaybe<Scalars['String']['input']>;
};


export type CategoryStoresArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<StoreFilter_Order>>>;
};

/** Cursor connection for Category. */
export type CategoryCursorConnection = {
  __typename?: 'CategoryCursorConnection';
  edges?: Maybe<Array<Maybe<CategoryEdge>>>;
  pageInfo: CategoryPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of Category. */
export type CategoryEdge = {
  __typename?: 'CategoryEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Category>;
};

export type CategoryFilter_Order = {
  name?: InputMaybe<Scalars['String']['input']>;
};

/** Information about the current page. */
export type CategoryPageInfo = {
  __typename?: 'CategoryPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Closing = Node & {
  __typename?: 'Closing';
  _id: Scalars['Int']['output'];
  cashAdded?: Maybe<Scalars['Float']['output']>;
  cashWithdrawn?: Maybe<Scalars['Float']['output']>;
  closedAt?: Maybe<Scalars['String']['output']>;
  closedBy?: Maybe<User>;
  closingBalance?: Maybe<Scalars['Float']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  data?: Maybe<Scalars['Iterable']['output']>;
  dateFrom?: Maybe<Scalars['String']['output']>;
  dateTo?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  denominations?: Maybe<Scalars['Iterable']['output']>;
  expenses?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  openedBy?: Maybe<User>;
  openingBalance?: Maybe<Scalars['Float']['output']>;
  store?: Maybe<Store>;
  terminal?: Maybe<Terminal>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
};

/** Cursor connection for Closing. */
export type ClosingCursorConnection = {
  __typename?: 'ClosingCursorConnection';
  edges?: Maybe<Array<Maybe<ClosingEdge>>>;
  pageInfo: ClosingPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of Closing. */
export type ClosingEdge = {
  __typename?: 'ClosingEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Closing>;
};

/** Information about the current page. */
export type ClosingPageInfo = {
  __typename?: 'ClosingPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Customer = Node & {
  __typename?: 'Customer';
  _id: Scalars['Int']['output'];
  address?: Maybe<Scalars['String']['output']>;
  birthday?: Maybe<Scalars['String']['output']>;
  cnic?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lat?: Maybe<Scalars['Float']['output']>;
  lng?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  openingBalance?: Maybe<Scalars['String']['output']>;
  orders?: Maybe<OrderCursorConnection>;
  outstanding: Scalars['Float']['output'];
  paid: Scalars['Float']['output'];
  payments?: Maybe<CustomerPaymentCursorConnection>;
  phone?: Maybe<Scalars['String']['output']>;
  sale: Scalars['Float']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
};


export type CustomerOrdersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderId?: InputMaybe<Scalars['Int']['input']>;
  orderId_list?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};


export type CustomerPaymentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** Cursor connection for Customer. */
export type CustomerCursorConnection = {
  __typename?: 'CustomerCursorConnection';
  edges?: Maybe<Array<Maybe<CustomerEdge>>>;
  pageInfo: CustomerPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of Customer. */
export type CustomerEdge = {
  __typename?: 'CustomerEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Customer>;
};

export type CustomerFilter_Order = {
  cnic?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  openingBalance?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

/** Information about the current page. */
export type CustomerPageInfo = {
  __typename?: 'CustomerPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type CustomerPayment = Node & {
  __typename?: 'CustomerPayment';
  _id: Scalars['Int']['output'];
  amount: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  customer: Customer;
  deletedAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  order?: Maybe<Order>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
};

/** Cursor connection for CustomerPayment. */
export type CustomerPaymentCursorConnection = {
  __typename?: 'CustomerPaymentCursorConnection';
  edges?: Maybe<Array<Maybe<CustomerPaymentEdge>>>;
  pageInfo: CustomerPaymentPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of CustomerPayment. */
export type CustomerPaymentEdge = {
  __typename?: 'CustomerPaymentEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<CustomerPayment>;
};

/** Information about the current page. */
export type CustomerPaymentPageInfo = {
  __typename?: 'CustomerPaymentPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Department = Node & {
  __typename?: 'Department';
  _id: Scalars['Int']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  store?: Maybe<Store>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
};

/** Cursor connection for Department. */
export type DepartmentCursorConnection = {
  __typename?: 'DepartmentCursorConnection';
  edges?: Maybe<Array<Maybe<DepartmentEdge>>>;
  pageInfo: DepartmentPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of Department. */
export type DepartmentEdge = {
  __typename?: 'DepartmentEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Department>;
};

export type DepartmentFilter_Order = {
  name?: InputMaybe<Scalars['String']['input']>;
};

/** Information about the current page. */
export type DepartmentPageInfo = {
  __typename?: 'DepartmentPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Device = Node & {
  __typename?: 'Device';
  _id: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  ipAddress: Scalars['String']['output'];
  name: Scalars['String']['output'];
  port: Scalars['Int']['output'];
  prints: Scalars['Int']['output'];
  uuid?: Maybe<Scalars['String']['output']>;
};

/** Cursor connection for Device. */
export type DeviceCursorConnection = {
  __typename?: 'DeviceCursorConnection';
  edges?: Maybe<Array<Maybe<DeviceEdge>>>;
  pageInfo: DevicePageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of Device. */
export type DeviceEdge = {
  __typename?: 'DeviceEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Device>;
};

/** Information about the current page. */
export type DevicePageInfo = {
  __typename?: 'DevicePageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Discount = Node & {
  __typename?: 'Discount';
  _id: Scalars['Int']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  rate?: Maybe<Scalars['String']['output']>;
  rateType?: Maybe<Scalars['String']['output']>;
  scope?: Maybe<Scalars['String']['output']>;
  stores?: Maybe<StoreCursorConnection>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
};


export type DiscountStoresArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<StoreFilter_Order>>>;
};

/** Cursor connection for Discount. */
export type DiscountCursorConnection = {
  __typename?: 'DiscountCursorConnection';
  edges?: Maybe<Array<Maybe<DiscountEdge>>>;
  pageInfo: DiscountPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of Discount. */
export type DiscountEdge = {
  __typename?: 'DiscountEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Discount>;
};

export type DiscountFilter_Order = {
  name?: InputMaybe<Scalars['String']['input']>;
  rate?: InputMaybe<Scalars['String']['input']>;
  rateType?: InputMaybe<Scalars['String']['input']>;
  scope?: InputMaybe<Scalars['String']['input']>;
};

/** Information about the current page. */
export type DiscountPageInfo = {
  __typename?: 'DiscountPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Expense = Node & {
  __typename?: 'Expense';
  _id: Scalars['Int']['output'];
  amount: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive?: Maybe<Scalars['Boolean']['output']>;
  store?: Maybe<Store>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  user: User;
  uuid?: Maybe<Scalars['String']['output']>;
};

/** Cursor connection for Expense. */
export type ExpenseCursorConnection = {
  __typename?: 'ExpenseCursorConnection';
  edges?: Maybe<Array<Maybe<ExpenseEdge>>>;
  pageInfo: ExpensePageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of Expense. */
export type ExpenseEdge = {
  __typename?: 'ExpenseEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Expense>;
};

/** Information about the current page. */
export type ExpensePageInfo = {
  __typename?: 'ExpensePageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Location = Node & {
  __typename?: 'Location';
  _id: Scalars['Int']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive?: Maybe<Scalars['Boolean']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
};

/** Cursor connection for Location. */
export type LocationCursorConnection = {
  __typename?: 'LocationCursorConnection';
  edges?: Maybe<Array<Maybe<LocationEdge>>>;
  pageInfo: LocationPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of Location. */
export type LocationEdge = {
  __typename?: 'LocationEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Location>;
};

/** Information about the current page. */
export type LocationPageInfo = {
  __typename?: 'LocationPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Media = Node & {
  __typename?: 'Media';
  _id: Scalars['Int']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  extension?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  mimeType?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  originalName: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Creates a Barcode. */
  createBarcode?: Maybe<CreateBarcodePayload>;
  /** Creates a Brand. */
  createBrand?: Maybe<CreateBrandPayload>;
  /** Creates a Category. */
  createCategory?: Maybe<CreateCategoryPayload>;
  /** Creates a Closing. */
  createClosing?: Maybe<CreateClosingPayload>;
  /** Creates a Customer. */
  createCustomer?: Maybe<CreateCustomerPayload>;
  /** Creates a CustomerPayment. */
  createCustomerPayment?: Maybe<CreateCustomerPaymentPayload>;
  /** Creates a Department. */
  createDepartment?: Maybe<CreateDepartmentPayload>;
  /** Creates a Device. */
  createDevice?: Maybe<CreateDevicePayload>;
  /** Creates a Discount. */
  createDiscount?: Maybe<CreateDiscountPayload>;
  /** Creates a Expense. */
  createExpense?: Maybe<CreateExpensePayload>;
  /** Creates a Location. */
  createLocation?: Maybe<CreateLocationPayload>;
  /** Creates a Media. */
  createMedia?: Maybe<CreateMediaPayload>;
  /** Creates a Order. */
  createOrder?: Maybe<CreateOrderPayload>;
  /** Creates a OrderDiscount. */
  createOrderDiscount?: Maybe<CreateOrderDiscountPayload>;
  /** Creates a OrderPayment. */
  createOrderPayment?: Maybe<CreateOrderPaymentPayload>;
  /** Creates a OrderProduct. */
  createOrderProduct?: Maybe<CreateOrderProductPayload>;
  /** Creates a OrderTax. */
  createOrderTax?: Maybe<CreateOrderTaxPayload>;
  /** Creates a Payment. */
  createPayment?: Maybe<CreatePaymentPayload>;
  /** Creates a Product. */
  createProduct?: Maybe<CreateProductPayload>;
  /** Creates a ProductInventory. */
  createProductInventory?: Maybe<CreateProductInventoryPayload>;
  /** Creates a ProductPrice. */
  createProductPrice?: Maybe<CreateProductPricePayload>;
  /** Creates a ProductVariant. */
  createProductVariant?: Maybe<CreateProductVariantPayload>;
  /** Creates a Purchase. */
  createPurchase?: Maybe<CreatePurchasePayload>;
  /** Creates a PurchaseItem. */
  createPurchaseItem?: Maybe<CreatePurchaseItemPayload>;
  /** Creates a PurchaseItemVariant. */
  createPurchaseItemVariant?: Maybe<CreatePurchaseItemVariantPayload>;
  /** Creates a PurchaseOrder. */
  createPurchaseOrder?: Maybe<CreatePurchaseOrderPayload>;
  /** Creates a PurchaseOrderItem. */
  createPurchaseOrderItem?: Maybe<CreatePurchaseOrderItemPayload>;
  /** Creates a PurchaseOrderItemVariant. */
  createPurchaseOrderItemVariant?: Maybe<CreatePurchaseOrderItemVariantPayload>;
  /** Creates a Setting. */
  createSetting?: Maybe<CreateSettingPayload>;
  /** Creates a Store. */
  createStore?: Maybe<CreateStorePayload>;
  /** Creates a Supplier. */
  createSupplier?: Maybe<CreateSupplierPayload>;
  /** Creates a SupplierPayment. */
  createSupplierPayment?: Maybe<CreateSupplierPaymentPayload>;
  /** Creates a Tax. */
  createTax?: Maybe<CreateTaxPayload>;
  /** Creates a Terminal. */
  createTerminal?: Maybe<CreateTerminalPayload>;
  /** Creates a User. */
  createUser?: Maybe<CreateUserPayload>;
  /** Deletes a Barcode. */
  deleteBarcode?: Maybe<DeleteBarcodePayload>;
  /** Deletes a Brand. */
  deleteBrand?: Maybe<DeleteBrandPayload>;
  /** Deletes a Category. */
  deleteCategory?: Maybe<DeleteCategoryPayload>;
  /** Deletes a Closing. */
  deleteClosing?: Maybe<DeleteClosingPayload>;
  /** Deletes a Customer. */
  deleteCustomer?: Maybe<DeleteCustomerPayload>;
  /** Deletes a CustomerPayment. */
  deleteCustomerPayment?: Maybe<DeleteCustomerPaymentPayload>;
  /** Deletes a Department. */
  deleteDepartment?: Maybe<DeleteDepartmentPayload>;
  /** Deletes a Device. */
  deleteDevice?: Maybe<DeleteDevicePayload>;
  /** Deletes a Discount. */
  deleteDiscount?: Maybe<DeleteDiscountPayload>;
  /** Deletes a Expense. */
  deleteExpense?: Maybe<DeleteExpensePayload>;
  /** Deletes a Location. */
  deleteLocation?: Maybe<DeleteLocationPayload>;
  /** Deletes a Media. */
  deleteMedia?: Maybe<DeleteMediaPayload>;
  /** Deletes a Order. */
  deleteOrder?: Maybe<DeleteOrderPayload>;
  /** Deletes a OrderDiscount. */
  deleteOrderDiscount?: Maybe<DeleteOrderDiscountPayload>;
  /** Deletes a OrderPayment. */
  deleteOrderPayment?: Maybe<DeleteOrderPaymentPayload>;
  /** Deletes a OrderProduct. */
  deleteOrderProduct?: Maybe<DeleteOrderProductPayload>;
  /** Deletes a OrderTax. */
  deleteOrderTax?: Maybe<DeleteOrderTaxPayload>;
  /** Deletes a Payment. */
  deletePayment?: Maybe<DeletePaymentPayload>;
  /** Deletes a Product. */
  deleteProduct?: Maybe<DeleteProductPayload>;
  /** Deletes a ProductInventory. */
  deleteProductInventory?: Maybe<DeleteProductInventoryPayload>;
  /** Deletes a ProductPrice. */
  deleteProductPrice?: Maybe<DeleteProductPricePayload>;
  /** Deletes a ProductVariant. */
  deleteProductVariant?: Maybe<DeleteProductVariantPayload>;
  /** Deletes a Purchase. */
  deletePurchase?: Maybe<DeletePurchasePayload>;
  /** Deletes a PurchaseItem. */
  deletePurchaseItem?: Maybe<DeletePurchaseItemPayload>;
  /** Deletes a PurchaseItemVariant. */
  deletePurchaseItemVariant?: Maybe<DeletePurchaseItemVariantPayload>;
  /** Deletes a PurchaseOrder. */
  deletePurchaseOrder?: Maybe<DeletePurchaseOrderPayload>;
  /** Deletes a PurchaseOrderItem. */
  deletePurchaseOrderItem?: Maybe<DeletePurchaseOrderItemPayload>;
  /** Deletes a PurchaseOrderItemVariant. */
  deletePurchaseOrderItemVariant?: Maybe<DeletePurchaseOrderItemVariantPayload>;
  /** Deletes a Setting. */
  deleteSetting?: Maybe<DeleteSettingPayload>;
  /** Deletes a Store. */
  deleteStore?: Maybe<DeleteStorePayload>;
  /** Deletes a Supplier. */
  deleteSupplier?: Maybe<DeleteSupplierPayload>;
  /** Deletes a SupplierPayment. */
  deleteSupplierPayment?: Maybe<DeleteSupplierPaymentPayload>;
  /** Deletes a Tax. */
  deleteTax?: Maybe<DeleteTaxPayload>;
  /** Deletes a Terminal. */
  deleteTerminal?: Maybe<DeleteTerminalPayload>;
  /** Deletes a User. */
  deleteUser?: Maybe<DeleteUserPayload>;
  /** Updates a Barcode. */
  updateBarcode?: Maybe<UpdateBarcodePayload>;
  /** Updates a Brand. */
  updateBrand?: Maybe<UpdateBrandPayload>;
  /** Updates a Category. */
  updateCategory?: Maybe<UpdateCategoryPayload>;
  /** Updates a Closing. */
  updateClosing?: Maybe<UpdateClosingPayload>;
  /** Updates a Customer. */
  updateCustomer?: Maybe<UpdateCustomerPayload>;
  /** Updates a CustomerPayment. */
  updateCustomerPayment?: Maybe<UpdateCustomerPaymentPayload>;
  /** Updates a Department. */
  updateDepartment?: Maybe<UpdateDepartmentPayload>;
  /** Updates a Device. */
  updateDevice?: Maybe<UpdateDevicePayload>;
  /** Updates a Discount. */
  updateDiscount?: Maybe<UpdateDiscountPayload>;
  /** Updates a Expense. */
  updateExpense?: Maybe<UpdateExpensePayload>;
  /** Updates a Location. */
  updateLocation?: Maybe<UpdateLocationPayload>;
  /** Updates a Media. */
  updateMedia?: Maybe<UpdateMediaPayload>;
  /** Updates a Order. */
  updateOrder?: Maybe<UpdateOrderPayload>;
  /** Updates a OrderDiscount. */
  updateOrderDiscount?: Maybe<UpdateOrderDiscountPayload>;
  /** Updates a OrderPayment. */
  updateOrderPayment?: Maybe<UpdateOrderPaymentPayload>;
  /** Updates a OrderProduct. */
  updateOrderProduct?: Maybe<UpdateOrderProductPayload>;
  /** Updates a OrderTax. */
  updateOrderTax?: Maybe<UpdateOrderTaxPayload>;
  /** Updates a Payment. */
  updatePayment?: Maybe<UpdatePaymentPayload>;
  /** Updates a Product. */
  updateProduct?: Maybe<UpdateProductPayload>;
  /** Updates a ProductInventory. */
  updateProductInventory?: Maybe<UpdateProductInventoryPayload>;
  /** Updates a ProductPrice. */
  updateProductPrice?: Maybe<UpdateProductPricePayload>;
  /** Updates a ProductVariant. */
  updateProductVariant?: Maybe<UpdateProductVariantPayload>;
  /** Updates a Purchase. */
  updatePurchase?: Maybe<UpdatePurchasePayload>;
  /** Updates a PurchaseItem. */
  updatePurchaseItem?: Maybe<UpdatePurchaseItemPayload>;
  /** Updates a PurchaseItemVariant. */
  updatePurchaseItemVariant?: Maybe<UpdatePurchaseItemVariantPayload>;
  /** Updates a PurchaseOrder. */
  updatePurchaseOrder?: Maybe<UpdatePurchaseOrderPayload>;
  /** Updates a PurchaseOrderItem. */
  updatePurchaseOrderItem?: Maybe<UpdatePurchaseOrderItemPayload>;
  /** Updates a PurchaseOrderItemVariant. */
  updatePurchaseOrderItemVariant?: Maybe<UpdatePurchaseOrderItemVariantPayload>;
  /** Updates a Setting. */
  updateSetting?: Maybe<UpdateSettingPayload>;
  /** Updates a Store. */
  updateStore?: Maybe<UpdateStorePayload>;
  /** Updates a Supplier. */
  updateSupplier?: Maybe<UpdateSupplierPayload>;
  /** Updates a SupplierPayment. */
  updateSupplierPayment?: Maybe<UpdateSupplierPaymentPayload>;
  /** Updates a Tax. */
  updateTax?: Maybe<UpdateTaxPayload>;
  /** Updates a Terminal. */
  updateTerminal?: Maybe<UpdateTerminalPayload>;
  /** Updates a User. */
  updateUser?: Maybe<UpdateUserPayload>;
};


export type MutationCreateBarcodeArgs = {
  input: CreateBarcodeInput;
};


export type MutationCreateBrandArgs = {
  input: CreateBrandInput;
};


export type MutationCreateCategoryArgs = {
  input: CreateCategoryInput;
};


export type MutationCreateClosingArgs = {
  input: CreateClosingInput;
};


export type MutationCreateCustomerArgs = {
  input: CreateCustomerInput;
};


export type MutationCreateCustomerPaymentArgs = {
  input: CreateCustomerPaymentInput;
};


export type MutationCreateDepartmentArgs = {
  input: CreateDepartmentInput;
};


export type MutationCreateDeviceArgs = {
  input: CreateDeviceInput;
};


export type MutationCreateDiscountArgs = {
  input: CreateDiscountInput;
};


export type MutationCreateExpenseArgs = {
  input: CreateExpenseInput;
};


export type MutationCreateLocationArgs = {
  input: CreateLocationInput;
};


export type MutationCreateMediaArgs = {
  input: CreateMediaInput;
};


export type MutationCreateOrderArgs = {
  input: CreateOrderInput;
};


export type MutationCreateOrderDiscountArgs = {
  input: CreateOrderDiscountInput;
};


export type MutationCreateOrderPaymentArgs = {
  input: CreateOrderPaymentInput;
};


export type MutationCreateOrderProductArgs = {
  input: CreateOrderProductInput;
};


export type MutationCreateOrderTaxArgs = {
  input: CreateOrderTaxInput;
};


export type MutationCreatePaymentArgs = {
  input: CreatePaymentInput;
};


export type MutationCreateProductArgs = {
  input: CreateProductInput;
};


export type MutationCreateProductInventoryArgs = {
  input: CreateProductInventoryInput;
};


export type MutationCreateProductPriceArgs = {
  input: CreateProductPriceInput;
};


export type MutationCreateProductVariantArgs = {
  input: CreateProductVariantInput;
};


export type MutationCreatePurchaseArgs = {
  input: CreatePurchaseInput;
};


export type MutationCreatePurchaseItemArgs = {
  input: CreatePurchaseItemInput;
};


export type MutationCreatePurchaseItemVariantArgs = {
  input: CreatePurchaseItemVariantInput;
};


export type MutationCreatePurchaseOrderArgs = {
  input: CreatePurchaseOrderInput;
};


export type MutationCreatePurchaseOrderItemArgs = {
  input: CreatePurchaseOrderItemInput;
};


export type MutationCreatePurchaseOrderItemVariantArgs = {
  input: CreatePurchaseOrderItemVariantInput;
};


export type MutationCreateSettingArgs = {
  input: CreateSettingInput;
};


export type MutationCreateStoreArgs = {
  input: CreateStoreInput;
};


export type MutationCreateSupplierArgs = {
  input: CreateSupplierInput;
};


export type MutationCreateSupplierPaymentArgs = {
  input: CreateSupplierPaymentInput;
};


export type MutationCreateTaxArgs = {
  input: CreateTaxInput;
};


export type MutationCreateTerminalArgs = {
  input: CreateTerminalInput;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationDeleteBarcodeArgs = {
  input: DeleteBarcodeInput;
};


export type MutationDeleteBrandArgs = {
  input: DeleteBrandInput;
};


export type MutationDeleteCategoryArgs = {
  input: DeleteCategoryInput;
};


export type MutationDeleteClosingArgs = {
  input: DeleteClosingInput;
};


export type MutationDeleteCustomerArgs = {
  input: DeleteCustomerInput;
};


export type MutationDeleteCustomerPaymentArgs = {
  input: DeleteCustomerPaymentInput;
};


export type MutationDeleteDepartmentArgs = {
  input: DeleteDepartmentInput;
};


export type MutationDeleteDeviceArgs = {
  input: DeleteDeviceInput;
};


export type MutationDeleteDiscountArgs = {
  input: DeleteDiscountInput;
};


export type MutationDeleteExpenseArgs = {
  input: DeleteExpenseInput;
};


export type MutationDeleteLocationArgs = {
  input: DeleteLocationInput;
};


export type MutationDeleteMediaArgs = {
  input: DeleteMediaInput;
};


export type MutationDeleteOrderArgs = {
  input: DeleteOrderInput;
};


export type MutationDeleteOrderDiscountArgs = {
  input: DeleteOrderDiscountInput;
};


export type MutationDeleteOrderPaymentArgs = {
  input: DeleteOrderPaymentInput;
};


export type MutationDeleteOrderProductArgs = {
  input: DeleteOrderProductInput;
};


export type MutationDeleteOrderTaxArgs = {
  input: DeleteOrderTaxInput;
};


export type MutationDeletePaymentArgs = {
  input: DeletePaymentInput;
};


export type MutationDeleteProductArgs = {
  input: DeleteProductInput;
};


export type MutationDeleteProductInventoryArgs = {
  input: DeleteProductInventoryInput;
};


export type MutationDeleteProductPriceArgs = {
  input: DeleteProductPriceInput;
};


export type MutationDeleteProductVariantArgs = {
  input: DeleteProductVariantInput;
};


export type MutationDeletePurchaseArgs = {
  input: DeletePurchaseInput;
};


export type MutationDeletePurchaseItemArgs = {
  input: DeletePurchaseItemInput;
};


export type MutationDeletePurchaseItemVariantArgs = {
  input: DeletePurchaseItemVariantInput;
};


export type MutationDeletePurchaseOrderArgs = {
  input: DeletePurchaseOrderInput;
};


export type MutationDeletePurchaseOrderItemArgs = {
  input: DeletePurchaseOrderItemInput;
};


export type MutationDeletePurchaseOrderItemVariantArgs = {
  input: DeletePurchaseOrderItemVariantInput;
};


export type MutationDeleteSettingArgs = {
  input: DeleteSettingInput;
};


export type MutationDeleteStoreArgs = {
  input: DeleteStoreInput;
};


export type MutationDeleteSupplierArgs = {
  input: DeleteSupplierInput;
};


export type MutationDeleteSupplierPaymentArgs = {
  input: DeleteSupplierPaymentInput;
};


export type MutationDeleteTaxArgs = {
  input: DeleteTaxInput;
};


export type MutationDeleteTerminalArgs = {
  input: DeleteTerminalInput;
};


export type MutationDeleteUserArgs = {
  input: DeleteUserInput;
};


export type MutationUpdateBarcodeArgs = {
  input: UpdateBarcodeInput;
};


export type MutationUpdateBrandArgs = {
  input: UpdateBrandInput;
};


export type MutationUpdateCategoryArgs = {
  input: UpdateCategoryInput;
};


export type MutationUpdateClosingArgs = {
  input: UpdateClosingInput;
};


export type MutationUpdateCustomerArgs = {
  input: UpdateCustomerInput;
};


export type MutationUpdateCustomerPaymentArgs = {
  input: UpdateCustomerPaymentInput;
};


export type MutationUpdateDepartmentArgs = {
  input: UpdateDepartmentInput;
};


export type MutationUpdateDeviceArgs = {
  input: UpdateDeviceInput;
};


export type MutationUpdateDiscountArgs = {
  input: UpdateDiscountInput;
};


export type MutationUpdateExpenseArgs = {
  input: UpdateExpenseInput;
};


export type MutationUpdateLocationArgs = {
  input: UpdateLocationInput;
};


export type MutationUpdateMediaArgs = {
  input: UpdateMediaInput;
};


export type MutationUpdateOrderArgs = {
  input: UpdateOrderInput;
};


export type MutationUpdateOrderDiscountArgs = {
  input: UpdateOrderDiscountInput;
};


export type MutationUpdateOrderPaymentArgs = {
  input: UpdateOrderPaymentInput;
};


export type MutationUpdateOrderProductArgs = {
  input: UpdateOrderProductInput;
};


export type MutationUpdateOrderTaxArgs = {
  input: UpdateOrderTaxInput;
};


export type MutationUpdatePaymentArgs = {
  input: UpdatePaymentInput;
};


export type MutationUpdateProductArgs = {
  input: UpdateProductInput;
};


export type MutationUpdateProductInventoryArgs = {
  input: UpdateProductInventoryInput;
};


export type MutationUpdateProductPriceArgs = {
  input: UpdateProductPriceInput;
};


export type MutationUpdateProductVariantArgs = {
  input: UpdateProductVariantInput;
};


export type MutationUpdatePurchaseArgs = {
  input: UpdatePurchaseInput;
};


export type MutationUpdatePurchaseItemArgs = {
  input: UpdatePurchaseItemInput;
};


export type MutationUpdatePurchaseItemVariantArgs = {
  input: UpdatePurchaseItemVariantInput;
};


export type MutationUpdatePurchaseOrderArgs = {
  input: UpdatePurchaseOrderInput;
};


export type MutationUpdatePurchaseOrderItemArgs = {
  input: UpdatePurchaseOrderItemInput;
};


export type MutationUpdatePurchaseOrderItemVariantArgs = {
  input: UpdatePurchaseOrderItemVariantInput;
};


export type MutationUpdateSettingArgs = {
  input: UpdateSettingInput;
};


export type MutationUpdateStoreArgs = {
  input: UpdateStoreInput;
};


export type MutationUpdateSupplierArgs = {
  input: UpdateSupplierInput;
};


export type MutationUpdateSupplierPaymentArgs = {
  input: UpdateSupplierPaymentInput;
};


export type MutationUpdateTaxArgs = {
  input: UpdateTaxInput;
};


export type MutationUpdateTerminalArgs = {
  input: UpdateTerminalInput;
};


export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};

/** A node, according to the Relay specification. */
export type Node = {
  /** The id of this node. */
  id: Scalars['ID']['output'];
};

export type Order = Node & {
  __typename?: 'Order';
  _id: Scalars['Int']['output'];
  adjustment?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  customer?: Maybe<Customer>;
  description?: Maybe<Scalars['String']['output']>;
  discount?: Maybe<OrderDiscount>;
  id: Scalars['ID']['output'];
  isDeleted?: Maybe<Scalars['Boolean']['output']>;
  isDispatched?: Maybe<Scalars['Boolean']['output']>;
  isReturned?: Maybe<Scalars['Boolean']['output']>;
  isSuspended?: Maybe<Scalars['Boolean']['output']>;
  items?: Maybe<OrderProductCursorConnection>;
  orderId?: Maybe<Scalars['Int']['output']>;
  payments?: Maybe<OrderPaymentCursorConnection>;
  returnedFrom?: Maybe<Order>;
  status?: Maybe<Scalars['String']['output']>;
  store?: Maybe<Store>;
  tax?: Maybe<OrderTax>;
  terminal?: Maybe<Terminal>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
  uuid?: Maybe<Scalars['String']['output']>;
};


export type OrderItemsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  discount?: InputMaybe<Scalars['String']['input']>;
  discount_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<InputMaybe<OrderProductFilter_Order>>>;
  order_orderId?: InputMaybe<Scalars['Int']['input']>;
  order_orderId_list?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  price?: InputMaybe<Scalars['String']['input']>;
  price_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  product_id?: InputMaybe<Scalars['Int']['input']>;
  product_id_list?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  quantity?: InputMaybe<Scalars['String']['input']>;
  quantity_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  variant_id?: InputMaybe<Scalars['Int']['input']>;
  variant_id_list?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};


export type OrderPaymentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** Cursor connection for Order. */
export type OrderCursorConnection = {
  __typename?: 'OrderCursorConnection';
  edges?: Maybe<Array<Maybe<OrderEdge>>>;
  pageInfo: OrderPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type OrderDiscount = Node & {
  __typename?: 'OrderDiscount';
  _id: Scalars['Int']['output'];
  amount: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  order?: Maybe<Order>;
  rate?: Maybe<Scalars['String']['output']>;
  rateType?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Discount>;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

/** Cursor connection for OrderDiscount. */
export type OrderDiscountCursorConnection = {
  __typename?: 'OrderDiscountCursorConnection';
  edges?: Maybe<Array<Maybe<OrderDiscountEdge>>>;
  pageInfo: OrderDiscountPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of OrderDiscount. */
export type OrderDiscountEdge = {
  __typename?: 'OrderDiscountEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<OrderDiscount>;
};

/** Information about the current page. */
export type OrderDiscountPageInfo = {
  __typename?: 'OrderDiscountPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** Edge of Order. */
export type OrderEdge = {
  __typename?: 'OrderEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Order>;
};

/** Information about the current page. */
export type OrderPageInfo = {
  __typename?: 'OrderPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type OrderPayment = Node & {
  __typename?: 'OrderPayment';
  _id: Scalars['Int']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  due: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  order?: Maybe<Order>;
  received: Scalars['String']['output'];
  total: Scalars['String']['output'];
  type?: Maybe<Payment>;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

/** Cursor connection for OrderPayment. */
export type OrderPaymentCursorConnection = {
  __typename?: 'OrderPaymentCursorConnection';
  edges?: Maybe<Array<Maybe<OrderPaymentEdge>>>;
  pageInfo: OrderPaymentPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of OrderPayment. */
export type OrderPaymentEdge = {
  __typename?: 'OrderPaymentEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<OrderPayment>;
};

/** Information about the current page. */
export type OrderPaymentPageInfo = {
  __typename?: 'OrderPaymentPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type OrderProduct = Node & {
  __typename?: 'OrderProduct';
  _id: Scalars['Int']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  discount?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isDeleted?: Maybe<Scalars['Boolean']['output']>;
  isReturned?: Maybe<Scalars['Boolean']['output']>;
  isSuspended?: Maybe<Scalars['Boolean']['output']>;
  order?: Maybe<Order>;
  price: Scalars['String']['output'];
  product: Product;
  quantity: Scalars['String']['output'];
  taxes?: Maybe<TaxCursorConnection>;
  taxesTotal: Scalars['Float']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
  variant?: Maybe<ProductVariant>;
};


export type OrderProductTaxesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  order?: InputMaybe<Array<InputMaybe<TaxFilter_Order>>>;
  rate?: InputMaybe<Scalars['String']['input']>;
  rate_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** Cursor connection for OrderProduct. */
export type OrderProductCursorConnection = {
  __typename?: 'OrderProductCursorConnection';
  edges?: Maybe<Array<Maybe<OrderProductEdge>>>;
  pageInfo: OrderProductPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of OrderProduct. */
export type OrderProductEdge = {
  __typename?: 'OrderProductEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<OrderProduct>;
};

export type OrderProductFilter_Order = {
  createdAt?: InputMaybe<Scalars['String']['input']>;
  discount?: InputMaybe<Scalars['String']['input']>;
  order_orderId?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['String']['input']>;
  quantity?: InputMaybe<Scalars['String']['input']>;
  variant_attributeValue?: InputMaybe<Scalars['String']['input']>;
};

/** Information about the current page. */
export type OrderProductPageInfo = {
  __typename?: 'OrderProductPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type OrderTax = Node & {
  __typename?: 'OrderTax';
  _id: Scalars['Int']['output'];
  amount: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  order?: Maybe<Order>;
  rate: Scalars['String']['output'];
  type?: Maybe<Tax>;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

/** Cursor connection for OrderTax. */
export type OrderTaxCursorConnection = {
  __typename?: 'OrderTaxCursorConnection';
  edges?: Maybe<Array<Maybe<OrderTaxEdge>>>;
  pageInfo: OrderTaxPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of OrderTax. */
export type OrderTaxEdge = {
  __typename?: 'OrderTaxEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<OrderTax>;
};

/** Information about the current page. */
export type OrderTaxPageInfo = {
  __typename?: 'OrderTaxPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Payment = Node & {
  __typename?: 'Payment';
  _id: Scalars['Int']['output'];
  canHaveChangeDue?: Maybe<Scalars['Boolean']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  stores?: Maybe<StoreCursorConnection>;
  type: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
};


export type PaymentStoresArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<StoreFilter_Order>>>;
};

/** Cursor connection for Payment. */
export type PaymentCursorConnection = {
  __typename?: 'PaymentCursorConnection';
  edges?: Maybe<Array<Maybe<PaymentEdge>>>;
  pageInfo: PaymentPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of Payment. */
export type PaymentEdge = {
  __typename?: 'PaymentEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Payment>;
};

export type PaymentFilter_Order = {
  name?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

/** Information about the current page. */
export type PaymentPageInfo = {
  __typename?: 'PaymentPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Product = Node & {
  __typename?: 'Product';
  _id: Scalars['Int']['output'];
  barcode?: Maybe<Scalars['String']['output']>;
  basePrice?: Maybe<Scalars['String']['output']>;
  baseQuantity?: Maybe<Scalars['Int']['output']>;
  brands?: Maybe<BrandCursorConnection>;
  categories?: Maybe<CategoryCursorConnection>;
  cost?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  department?: Maybe<Department>;
  id: Scalars['ID']['output'];
  inventory?: Maybe<ProductInventoryCursorConnection>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  isAvailable?: Maybe<Scalars['Boolean']['output']>;
  manageInventory?: Maybe<Scalars['Boolean']['output']>;
  media?: Maybe<Media>;
  name: Scalars['String']['output'];
  prices?: Maybe<ProductPriceCursorConnection>;
  purchaseUnit?: Maybe<Scalars['String']['output']>;
  quantity?: Maybe<Scalars['String']['output']>;
  saleUnit?: Maybe<Scalars['String']['output']>;
  sku?: Maybe<Scalars['String']['output']>;
  suppliers?: Maybe<SupplierCursorConnection>;
  taxes?: Maybe<TaxCursorConnection>;
  terminals?: Maybe<TerminalCursorConnection>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
  variants?: Maybe<ProductVariantCursorConnection>;
};


export type ProductBrandsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<BrandFilter_Order>>>;
};


export type ProductCategoriesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<CategoryFilter_Order>>>;
  type?: InputMaybe<Scalars['String']['input']>;
};


export type ProductInventoryArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type ProductPricesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type ProductSuppliersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  openingBalance?: InputMaybe<Scalars['String']['input']>;
  openingBalance_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  order?: InputMaybe<Array<InputMaybe<SupplierFilter_Order>>>;
  phone?: InputMaybe<Scalars['String']['input']>;
};


export type ProductTaxesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  order?: InputMaybe<Array<InputMaybe<TaxFilter_Order>>>;
  rate?: InputMaybe<Scalars['String']['input']>;
  rate_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ProductTerminalsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  code_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<InputMaybe<TerminalFilter_Order>>>;
  products_name?: InputMaybe<Scalars['String']['input']>;
};


export type ProductVariantsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** Cursor connection for Product. */
export type ProductCursorConnection = {
  __typename?: 'ProductCursorConnection';
  edges?: Maybe<Array<Maybe<ProductEdge>>>;
  pageInfo: ProductPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of Product. */
export type ProductEdge = {
  __typename?: 'ProductEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Product>;
};

export type ProductFilter_Order = {
  barcode?: InputMaybe<Scalars['String']['input']>;
  basePrice?: InputMaybe<Scalars['String']['input']>;
  brands_name?: InputMaybe<Scalars['String']['input']>;
  categories_name?: InputMaybe<Scalars['String']['input']>;
  cost?: InputMaybe<Scalars['String']['input']>;
  department_name?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  suppliers_name?: InputMaybe<Scalars['String']['input']>;
  taxes_name?: InputMaybe<Scalars['String']['input']>;
};

export type ProductInventory = Node & {
  __typename?: 'ProductInventory';
  _id: Scalars['Int']['output'];
  entity?: Maybe<Scalars['String']['output']>;
  entityType?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  product: Product;
  quantity: Scalars['Float']['output'];
};

/** Cursor connection for ProductInventory. */
export type ProductInventoryCursorConnection = {
  __typename?: 'ProductInventoryCursorConnection';
  edges?: Maybe<Array<Maybe<ProductInventoryEdge>>>;
  pageInfo: ProductInventoryPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of ProductInventory. */
export type ProductInventoryEdge = {
  __typename?: 'ProductInventoryEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<ProductInventory>;
};

/** Information about the current page. */
export type ProductInventoryPageInfo = {
  __typename?: 'ProductInventoryPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** Information about the current page. */
export type ProductPageInfo = {
  __typename?: 'ProductPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type ProductPrice = Node & {
  __typename?: 'ProductPrice';
  _id: Scalars['Int']['output'];
  basePrice: Scalars['String']['output'];
  baseQuantity?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['Int']['output']>;
  day?: Maybe<Scalars['Int']['output']>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  maxQuantity?: Maybe<Scalars['String']['output']>;
  minQuantity?: Maybe<Scalars['String']['output']>;
  month?: Maybe<Scalars['Int']['output']>;
  product: Product;
  productVariant?: Maybe<ProductVariant>;
  quarter?: Maybe<Scalars['Int']['output']>;
  rate?: Maybe<Scalars['String']['output']>;
  time?: Maybe<Scalars['String']['output']>;
  timeTo?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
  week?: Maybe<Scalars['Int']['output']>;
};

/** Cursor connection for ProductPrice. */
export type ProductPriceCursorConnection = {
  __typename?: 'ProductPriceCursorConnection';
  edges?: Maybe<Array<Maybe<ProductPriceEdge>>>;
  pageInfo: ProductPricePageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of ProductPrice. */
export type ProductPriceEdge = {
  __typename?: 'ProductPriceEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<ProductPrice>;
};

/** Information about the current page. */
export type ProductPricePageInfo = {
  __typename?: 'ProductPricePageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type ProductVariant = Node & {
  __typename?: 'ProductVariant';
  _id: Scalars['Int']['output'];
  attributeName?: Maybe<Scalars['String']['output']>;
  attributeValue?: Maybe<Scalars['String']['output']>;
  barcode?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
};

/** Cursor connection for ProductVariant. */
export type ProductVariantCursorConnection = {
  __typename?: 'ProductVariantCursorConnection';
  edges?: Maybe<Array<Maybe<ProductVariantEdge>>>;
  pageInfo: ProductVariantPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of ProductVariant. */
export type ProductVariantEdge = {
  __typename?: 'ProductVariantEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<ProductVariant>;
};

/** Information about the current page. */
export type ProductVariantPageInfo = {
  __typename?: 'ProductVariantPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Purchase = Node & {
  __typename?: 'Purchase';
  _id: Scalars['Int']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  items?: Maybe<PurchaseItemCursorConnection>;
  paymentType?: Maybe<Payment>;
  purchaseMode?: Maybe<Scalars['String']['output']>;
  purchaseNumber?: Maybe<Scalars['String']['output']>;
  purchaseOrder?: Maybe<PurchaseOrder>;
  purchasedBy: User;
  store: Store;
  supplier?: Maybe<Supplier>;
  total: Scalars['Float']['output'];
  updatePrice?: Maybe<Scalars['Boolean']['output']>;
  updateStocks?: Maybe<Scalars['Boolean']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
};


export type PurchaseItemsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  item_id?: InputMaybe<Scalars['Int']['input']>;
  item_id_list?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<InputMaybe<PurchaseItemFilter_Order>>>;
  purchasePrice?: InputMaybe<Scalars['String']['input']>;
  purchasePrice_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  purchase_purchaseNumber?: InputMaybe<Scalars['String']['input']>;
  purchase_purchaseNumber_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  quantity?: InputMaybe<Scalars['String']['input']>;
  quantityRequested?: InputMaybe<Scalars['String']['input']>;
  quantityRequested_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  quantity_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** Cursor connection for Purchase. */
export type PurchaseCursorConnection = {
  __typename?: 'PurchaseCursorConnection';
  edges?: Maybe<Array<Maybe<PurchaseEdge>>>;
  pageInfo: PurchasePageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of Purchase. */
export type PurchaseEdge = {
  __typename?: 'PurchaseEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Purchase>;
};

export type PurchaseFilter_Order = {
  createdAt?: InputMaybe<Scalars['String']['input']>;
  paymentType_name?: InputMaybe<Scalars['String']['input']>;
  purchaseNumber?: InputMaybe<Scalars['String']['input']>;
  purchaseOrder_poNumber?: InputMaybe<Scalars['String']['input']>;
  supplier_name?: InputMaybe<Scalars['String']['input']>;
};

export type PurchaseItem = Node & {
  __typename?: 'PurchaseItem';
  _id: Scalars['Int']['output'];
  barcode?: Maybe<Scalars['String']['output']>;
  comments?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  item: Product;
  purchase: Purchase;
  purchasePrice: Scalars['String']['output'];
  purchaseUnit?: Maybe<Scalars['String']['output']>;
  quantity: Scalars['String']['output'];
  quantityRequested?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
  variants?: Maybe<PurchaseItemVariantCursorConnection>;
};


export type PurchaseItemVariantsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** Cursor connection for PurchaseItem. */
export type PurchaseItemCursorConnection = {
  __typename?: 'PurchaseItemCursorConnection';
  edges?: Maybe<Array<Maybe<PurchaseItemEdge>>>;
  pageInfo: PurchaseItemPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of PurchaseItem. */
export type PurchaseItemEdge = {
  __typename?: 'PurchaseItemEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<PurchaseItem>;
};

export type PurchaseItemFilter_Order = {
  createdAt?: InputMaybe<Scalars['String']['input']>;
  purchasePrice?: InputMaybe<Scalars['String']['input']>;
  purchase_purchaseNumber?: InputMaybe<Scalars['String']['input']>;
  quantity?: InputMaybe<Scalars['String']['input']>;
  quantityRequested?: InputMaybe<Scalars['String']['input']>;
};

/** Information about the current page. */
export type PurchaseItemPageInfo = {
  __typename?: 'PurchaseItemPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type PurchaseItemVariant = Node & {
  __typename?: 'PurchaseItemVariant';
  _id: Scalars['Int']['output'];
  barcode?: Maybe<Scalars['String']['output']>;
  comments?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  purchaseItem: PurchaseItem;
  purchasePrice: Scalars['String']['output'];
  purchaseUnit?: Maybe<Scalars['String']['output']>;
  quantity: Scalars['String']['output'];
  quantityRequested?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
  variant: ProductVariant;
};

/** Cursor connection for PurchaseItemVariant. */
export type PurchaseItemVariantCursorConnection = {
  __typename?: 'PurchaseItemVariantCursorConnection';
  edges?: Maybe<Array<Maybe<PurchaseItemVariantEdge>>>;
  pageInfo: PurchaseItemVariantPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of PurchaseItemVariant. */
export type PurchaseItemVariantEdge = {
  __typename?: 'PurchaseItemVariantEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<PurchaseItemVariant>;
};

/** Information about the current page. */
export type PurchaseItemVariantPageInfo = {
  __typename?: 'PurchaseItemVariantPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type PurchaseOrder = Node & {
  __typename?: 'PurchaseOrder';
  _id: Scalars['Int']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isUsed?: Maybe<Scalars['Boolean']['output']>;
  items?: Maybe<PurchaseOrderItemCursorConnection>;
  poNumber?: Maybe<Scalars['String']['output']>;
  store: Store;
  supplier: Supplier;
  updatedAt?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
};


export type PurchaseOrderItemsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** Cursor connection for PurchaseOrder. */
export type PurchaseOrderCursorConnection = {
  __typename?: 'PurchaseOrderCursorConnection';
  edges?: Maybe<Array<Maybe<PurchaseOrderEdge>>>;
  pageInfo: PurchaseOrderPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of PurchaseOrder. */
export type PurchaseOrderEdge = {
  __typename?: 'PurchaseOrderEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<PurchaseOrder>;
};

export type PurchaseOrderFilter_Order = {
  createdAt?: InputMaybe<Scalars['String']['input']>;
  poNumber?: InputMaybe<Scalars['String']['input']>;
  supplier_name?: InputMaybe<Scalars['String']['input']>;
};

export type PurchaseOrderItem = Node & {
  __typename?: 'PurchaseOrderItem';
  _id: Scalars['Int']['output'];
  comments?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  item: Product;
  price: Scalars['String']['output'];
  purchaseOrder: PurchaseOrder;
  quantity: Scalars['String']['output'];
  unit?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
  variants?: Maybe<PurchaseOrderItemVariantCursorConnection>;
};


export type PurchaseOrderItemVariantsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** Cursor connection for PurchaseOrderItem. */
export type PurchaseOrderItemCursorConnection = {
  __typename?: 'PurchaseOrderItemCursorConnection';
  edges?: Maybe<Array<Maybe<PurchaseOrderItemEdge>>>;
  pageInfo: PurchaseOrderItemPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of PurchaseOrderItem. */
export type PurchaseOrderItemEdge = {
  __typename?: 'PurchaseOrderItemEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<PurchaseOrderItem>;
};

/** Information about the current page. */
export type PurchaseOrderItemPageInfo = {
  __typename?: 'PurchaseOrderItemPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type PurchaseOrderItemVariant = Node & {
  __typename?: 'PurchaseOrderItemVariant';
  createdAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
};

/** Cursor connection for PurchaseOrderItemVariant. */
export type PurchaseOrderItemVariantCursorConnection = {
  __typename?: 'PurchaseOrderItemVariantCursorConnection';
  edges?: Maybe<Array<Maybe<PurchaseOrderItemVariantEdge>>>;
  pageInfo: PurchaseOrderItemVariantPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of PurchaseOrderItemVariant. */
export type PurchaseOrderItemVariantEdge = {
  __typename?: 'PurchaseOrderItemVariantEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<PurchaseOrderItemVariant>;
};

/** Information about the current page. */
export type PurchaseOrderItemVariantPageInfo = {
  __typename?: 'PurchaseOrderItemVariantPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** Information about the current page. */
export type PurchaseOrderPageInfo = {
  __typename?: 'PurchaseOrderPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** Information about the current page. */
export type PurchasePageInfo = {
  __typename?: 'PurchasePageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  barcode?: Maybe<Barcode>;
  barcodes?: Maybe<BarcodeCursorConnection>;
  brand?: Maybe<Brand>;
  brands?: Maybe<BrandCursorConnection>;
  categories?: Maybe<CategoryCursorConnection>;
  category?: Maybe<Category>;
  closing?: Maybe<Closing>;
  closings?: Maybe<ClosingCursorConnection>;
  customer?: Maybe<Customer>;
  customerPayment?: Maybe<CustomerPayment>;
  customerPayments?: Maybe<CustomerPaymentCursorConnection>;
  customers?: Maybe<CustomerCursorConnection>;
  department?: Maybe<Department>;
  departments?: Maybe<DepartmentCursorConnection>;
  device?: Maybe<Device>;
  devices?: Maybe<DeviceCursorConnection>;
  discount?: Maybe<Discount>;
  discounts?: Maybe<DiscountCursorConnection>;
  expense?: Maybe<Expense>;
  expenses?: Maybe<ExpenseCursorConnection>;
  location?: Maybe<Location>;
  locations?: Maybe<LocationCursorConnection>;
  media?: Maybe<Media>;
  node?: Maybe<Node>;
  order?: Maybe<Order>;
  orderDiscount?: Maybe<OrderDiscount>;
  orderDiscounts?: Maybe<OrderDiscountCursorConnection>;
  orderPayment?: Maybe<OrderPayment>;
  orderPayments?: Maybe<OrderPaymentCursorConnection>;
  orderProduct?: Maybe<OrderProduct>;
  orderProducts?: Maybe<OrderProductCursorConnection>;
  orderTax?: Maybe<OrderTax>;
  orderTaxes?: Maybe<OrderTaxCursorConnection>;
  orders?: Maybe<OrderCursorConnection>;
  payment?: Maybe<Payment>;
  payments?: Maybe<PaymentCursorConnection>;
  product?: Maybe<Product>;
  productInventories?: Maybe<ProductInventoryCursorConnection>;
  productInventory?: Maybe<ProductInventory>;
  productPrice?: Maybe<ProductPrice>;
  productPrices?: Maybe<ProductPriceCursorConnection>;
  productVariant?: Maybe<ProductVariant>;
  productVariants?: Maybe<ProductVariantCursorConnection>;
  products?: Maybe<ProductCursorConnection>;
  purchase?: Maybe<Purchase>;
  purchaseItem?: Maybe<PurchaseItem>;
  purchaseItemVariant?: Maybe<PurchaseItemVariant>;
  purchaseItemVariants?: Maybe<PurchaseItemVariantCursorConnection>;
  purchaseItems?: Maybe<PurchaseItemCursorConnection>;
  purchaseOrder?: Maybe<PurchaseOrder>;
  purchaseOrderItem?: Maybe<PurchaseOrderItem>;
  purchaseOrderItemVariant?: Maybe<PurchaseOrderItemVariant>;
  purchaseOrderItemVariants?: Maybe<PurchaseOrderItemVariantCursorConnection>;
  purchaseOrderItems?: Maybe<PurchaseOrderItemCursorConnection>;
  purchaseOrders?: Maybe<PurchaseOrderCursorConnection>;
  purchases?: Maybe<PurchaseCursorConnection>;
  setting?: Maybe<Setting>;
  settings?: Maybe<SettingCursorConnection>;
  store?: Maybe<Store>;
  stores?: Maybe<StoreCursorConnection>;
  supplier?: Maybe<Supplier>;
  supplierPayment?: Maybe<SupplierPayment>;
  supplierPayments?: Maybe<SupplierPaymentCursorConnection>;
  suppliers?: Maybe<SupplierCursorConnection>;
  tax?: Maybe<Tax>;
  taxes?: Maybe<TaxCursorConnection>;
  terminal?: Maybe<Terminal>;
  terminals?: Maybe<TerminalCursorConnection>;
  user?: Maybe<User>;
  users?: Maybe<UserCursorConnection>;
};


export type QueryBarcodeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBarcodesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  barcode?: InputMaybe<Scalars['String']['input']>;
  barcode_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryBrandArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBrandsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<BrandFilter_Order>>>;
};


export type QueryCategoriesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<CategoryFilter_Order>>>;
  type?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type QueryClosingArgs = {
  id: Scalars['ID']['input'];
};


export type QueryClosingsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCustomerArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCustomerPaymentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCustomerPaymentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCustomersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  cnic?: InputMaybe<Scalars['String']['input']>;
  cnic_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  email?: InputMaybe<Scalars['String']['input']>;
  email_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  openingBalance?: InputMaybe<Scalars['String']['input']>;
  openingBalance_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  order?: InputMaybe<Array<InputMaybe<CustomerFilter_Order>>>;
  phone?: InputMaybe<Scalars['String']['input']>;
  phone_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryDepartmentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDepartmentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<DepartmentFilter_Order>>>;
};


export type QueryDeviceArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDevicesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryDiscountArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDiscountsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<DiscountFilter_Order>>>;
  rate?: InputMaybe<Scalars['String']['input']>;
  rateType?: InputMaybe<Scalars['String']['input']>;
  rateType_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  scope?: InputMaybe<Scalars['String']['input']>;
  scope_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryExpenseArgs = {
  id: Scalars['ID']['input'];
};


export type QueryExpensesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryLocationArgs = {
  id: Scalars['ID']['input'];
};


export type QueryLocationsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMediaArgs = {
  id: Scalars['ID']['input'];
};


export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrderDiscountArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrderDiscountsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryOrderPaymentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrderPaymentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryOrderProductArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrderProductsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  discount?: InputMaybe<Scalars['String']['input']>;
  discount_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<InputMaybe<OrderProductFilter_Order>>>;
  order_orderId?: InputMaybe<Scalars['Int']['input']>;
  order_orderId_list?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  price?: InputMaybe<Scalars['String']['input']>;
  price_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  product_id?: InputMaybe<Scalars['Int']['input']>;
  product_id_list?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  quantity?: InputMaybe<Scalars['String']['input']>;
  quantity_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  variant_id?: InputMaybe<Scalars['Int']['input']>;
  variant_id_list?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};


export type QueryOrderTaxArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrderTaxesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryOrdersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  orderId?: InputMaybe<Scalars['Int']['input']>;
  orderId_list?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};


export type QueryPaymentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPaymentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<PaymentFilter_Order>>>;
  type?: InputMaybe<Scalars['String']['input']>;
  type_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryProductArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProductInventoriesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryProductInventoryArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProductPriceArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProductPricesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryProductVariantArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProductVariantsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryProductsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  barcode?: InputMaybe<Scalars['String']['input']>;
  barcode_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  basePrice?: InputMaybe<Scalars['String']['input']>;
  basePrice_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  before?: InputMaybe<Scalars['String']['input']>;
  brands_name?: InputMaybe<Scalars['String']['input']>;
  categories_name?: InputMaybe<Scalars['String']['input']>;
  cost?: InputMaybe<Scalars['String']['input']>;
  cost_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  department_name?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<ProductFilter_Order>>>;
  suppliers_name?: InputMaybe<Scalars['String']['input']>;
  taxes_name?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPurchaseArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPurchaseItemArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPurchaseItemVariantArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPurchaseItemVariantsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPurchaseItemsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  item_id?: InputMaybe<Scalars['Int']['input']>;
  item_id_list?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<InputMaybe<PurchaseItemFilter_Order>>>;
  purchasePrice?: InputMaybe<Scalars['String']['input']>;
  purchasePrice_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  purchase_purchaseNumber?: InputMaybe<Scalars['String']['input']>;
  purchase_purchaseNumber_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  quantity?: InputMaybe<Scalars['String']['input']>;
  quantityRequested?: InputMaybe<Scalars['String']['input']>;
  quantityRequested_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  quantity_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryPurchaseOrderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPurchaseOrderItemArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPurchaseOrderItemVariantArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPurchaseOrderItemVariantsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPurchaseOrderItemsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPurchaseOrdersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isUsed?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<InputMaybe<PurchaseOrderFilter_Order>>>;
  poNumber?: InputMaybe<Scalars['String']['input']>;
  poNumber_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  supplier_name?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPurchasesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<InputMaybe<PurchaseFilter_Order>>>;
  paymentType_name?: InputMaybe<Scalars['String']['input']>;
  purchaseNumber?: InputMaybe<Scalars['String']['input']>;
  purchaseNumber_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  purchaseOrder_poNumber?: InputMaybe<Scalars['String']['input']>;
  purchaseOrder_poNumber_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  supplier_name?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySettingArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySettingsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryStoreArgs = {
  id: Scalars['ID']['input'];
};


export type QueryStoresArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<StoreFilter_Order>>>;
};


export type QuerySupplierArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySupplierPaymentArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySupplierPaymentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QuerySuppliersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  openingBalance?: InputMaybe<Scalars['String']['input']>;
  openingBalance_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  order?: InputMaybe<Array<InputMaybe<SupplierFilter_Order>>>;
  phone?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTaxArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTaxesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  order?: InputMaybe<Array<InputMaybe<TaxFilter_Order>>>;
  rate?: InputMaybe<Scalars['String']['input']>;
  rate_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryTerminalArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTerminalsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  code_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<InputMaybe<TerminalFilter_Order>>>;
  products_name?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUsersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  email_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<InputMaybe<UserFilter_Order>>>;
  username?: InputMaybe<Scalars['String']['input']>;
  username_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type Setting = Node & {
  __typename?: 'Setting';
  _id: Scalars['Int']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  type?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
  value?: Maybe<Scalars['String']['output']>;
};

/** Cursor connection for Setting. */
export type SettingCursorConnection = {
  __typename?: 'SettingCursorConnection';
  edges?: Maybe<Array<Maybe<SettingEdge>>>;
  pageInfo: SettingPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of Setting. */
export type SettingEdge = {
  __typename?: 'SettingEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Setting>;
};

/** Information about the current page. */
export type SettingPageInfo = {
  __typename?: 'SettingPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Store = Node & {
  __typename?: 'Store';
  _id: Scalars['Int']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive?: Maybe<Scalars['Boolean']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  terminals?: Maybe<TerminalCursorConnection>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
};


export type StoreTerminalsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  code_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<InputMaybe<TerminalFilter_Order>>>;
  products_name?: InputMaybe<Scalars['String']['input']>;
};

/** Cursor connection for Store. */
export type StoreCursorConnection = {
  __typename?: 'StoreCursorConnection';
  edges?: Maybe<Array<Maybe<StoreEdge>>>;
  pageInfo: StorePageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of Store. */
export type StoreEdge = {
  __typename?: 'StoreEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Store>;
};

export type StoreFilter_Order = {
  location?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

/** Information about the current page. */
export type StorePageInfo = {
  __typename?: 'StorePageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Supplier = Node & {
  __typename?: 'Supplier';
  _id: Scalars['Int']['output'];
  address?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  fax?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  media?: Maybe<Media>;
  name: Scalars['String']['output'];
  openingBalance?: Maybe<Scalars['String']['output']>;
  outstanding: Scalars['Float']['output'];
  paid: Scalars['Float']['output'];
  payments?: Maybe<SupplierPaymentCursorConnection>;
  phone?: Maybe<Scalars['String']['output']>;
  purchaseOrders?: Maybe<PurchaseOrderCursorConnection>;
  purchaseTotal: Scalars['Float']['output'];
  purchases?: Maybe<PurchaseCursorConnection>;
  stores?: Maybe<StoreCursorConnection>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
  whatsApp?: Maybe<Scalars['String']['output']>;
};


export type SupplierPaymentsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type SupplierPurchaseOrdersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isUsed?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<InputMaybe<PurchaseOrderFilter_Order>>>;
  poNumber?: InputMaybe<Scalars['String']['input']>;
  poNumber_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  supplier_name?: InputMaybe<Scalars['String']['input']>;
};


export type SupplierPurchasesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Array<InputMaybe<PurchaseFilter_Order>>>;
  paymentType_name?: InputMaybe<Scalars['String']['input']>;
  purchaseNumber?: InputMaybe<Scalars['String']['input']>;
  purchaseNumber_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  purchaseOrder_poNumber?: InputMaybe<Scalars['String']['input']>;
  purchaseOrder_poNumber_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  supplier_name?: InputMaybe<Scalars['String']['input']>;
};


export type SupplierStoresArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<StoreFilter_Order>>>;
};

/** Cursor connection for Supplier. */
export type SupplierCursorConnection = {
  __typename?: 'SupplierCursorConnection';
  edges?: Maybe<Array<Maybe<SupplierEdge>>>;
  pageInfo: SupplierPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of Supplier. */
export type SupplierEdge = {
  __typename?: 'SupplierEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Supplier>;
};

export type SupplierFilter_Order = {
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  openingBalance?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

/** Information about the current page. */
export type SupplierPageInfo = {
  __typename?: 'SupplierPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type SupplierPayment = Node & {
  __typename?: 'SupplierPayment';
  _id: Scalars['Int']['output'];
  amount: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  purchase?: Maybe<Purchase>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
};

/** Cursor connection for SupplierPayment. */
export type SupplierPaymentCursorConnection = {
  __typename?: 'SupplierPaymentCursorConnection';
  edges?: Maybe<Array<Maybe<SupplierPaymentEdge>>>;
  pageInfo: SupplierPaymentPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of SupplierPayment. */
export type SupplierPaymentEdge = {
  __typename?: 'SupplierPaymentEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<SupplierPayment>;
};

/** Information about the current page. */
export type SupplierPaymentPageInfo = {
  __typename?: 'SupplierPaymentPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Tax = Node & {
  __typename?: 'Tax';
  _id: Scalars['Int']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  rate: Scalars['String']['output'];
  stores?: Maybe<StoreCursorConnection>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
};


export type TaxStoresArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<StoreFilter_Order>>>;
};

/** Cursor connection for Tax. */
export type TaxCursorConnection = {
  __typename?: 'TaxCursorConnection';
  edges?: Maybe<Array<Maybe<TaxEdge>>>;
  pageInfo: TaxPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of Tax. */
export type TaxEdge = {
  __typename?: 'TaxEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Tax>;
};

export type TaxFilter_Order = {
  name?: InputMaybe<Scalars['String']['input']>;
  rate?: InputMaybe<Scalars['String']['input']>;
};

/** Information about the current page. */
export type TaxPageInfo = {
  __typename?: 'TaxPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Terminal = Node & {
  __typename?: 'Terminal';
  _id: Scalars['Int']['output'];
  code: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive?: Maybe<Scalars['Boolean']['output']>;
  products?: Maybe<ProductCursorConnection>;
  store?: Maybe<Store>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  uuid?: Maybe<Scalars['String']['output']>;
};


export type TerminalProductsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  barcode?: InputMaybe<Scalars['String']['input']>;
  barcode_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  basePrice?: InputMaybe<Scalars['String']['input']>;
  basePrice_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  before?: InputMaybe<Scalars['String']['input']>;
  brands_name?: InputMaybe<Scalars['String']['input']>;
  categories_name?: InputMaybe<Scalars['String']['input']>;
  cost?: InputMaybe<Scalars['String']['input']>;
  cost_list?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  department_name?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<ProductFilter_Order>>>;
  suppliers_name?: InputMaybe<Scalars['String']['input']>;
  taxes_name?: InputMaybe<Scalars['String']['input']>;
};

/** Cursor connection for Terminal. */
export type TerminalCursorConnection = {
  __typename?: 'TerminalCursorConnection';
  edges?: Maybe<Array<Maybe<TerminalEdge>>>;
  pageInfo: TerminalPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of Terminal. */
export type TerminalEdge = {
  __typename?: 'TerminalEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Terminal>;
};

export type TerminalFilter_Order = {
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  products_name?: InputMaybe<Scalars['String']['input']>;
};

/** Information about the current page. */
export type TerminalPageInfo = {
  __typename?: 'TerminalPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type User = Node & {
  __typename?: 'User';
  _id: Scalars['Int']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  displayName: Scalars['String']['output'];
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive?: Maybe<Scalars['Boolean']['output']>;
  roles: Scalars['Iterable']['output'];
  stores?: Maybe<StoreCursorConnection>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  username: Scalars['String']['output'];
  uuid?: Maybe<Scalars['String']['output']>;
};


export type UserStoresArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<StoreFilter_Order>>>;
};

/** Cursor connection for User. */
export type UserCursorConnection = {
  __typename?: 'UserCursorConnection';
  edges?: Maybe<Array<Maybe<UserEdge>>>;
  pageInfo: UserPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of User. */
export type UserEdge = {
  __typename?: 'UserEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<User>;
};

export type UserFilter_Order = {
  displayName?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

/** Information about the current page. */
export type UserPageInfo = {
  __typename?: 'UserPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type CreateBarcodeInput = {
  barcode: Scalars['String']['input'];
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  item?: InputMaybe<Scalars['String']['input']>;
  measurement?: InputMaybe<Scalars['String']['input']>;
  price: Scalars['String']['input'];
  unit?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  usages?: InputMaybe<Scalars['Int']['input']>;
  used?: InputMaybe<Scalars['Int']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
  variant?: InputMaybe<Scalars['String']['input']>;
};

export type CreateBarcodePayload = {
  __typename?: 'createBarcodePayload';
  barcode?: Maybe<Barcode>;
  clientMutationId?: Maybe<Scalars['String']['output']>;
};

export type CreateBrandInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  media?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  stores?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type CreateBrandPayload = {
  __typename?: 'createBrandPayload';
  brand?: Maybe<Brand>;
  clientMutationId?: Maybe<Scalars['String']['output']>;
};

export type CreateCategoryInput = {
  children?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  parent?: InputMaybe<Scalars['String']['input']>;
  stores?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type CreateCategoryPayload = {
  __typename?: 'createCategoryPayload';
  category?: Maybe<Category>;
  clientMutationId?: Maybe<Scalars['String']['output']>;
};

export type CreateClosingInput = {
  cashAdded?: InputMaybe<Scalars['Float']['input']>;
  cashWithdrawn?: InputMaybe<Scalars['Float']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  closedAt?: InputMaybe<Scalars['String']['input']>;
  closedBy?: InputMaybe<Scalars['String']['input']>;
  closingBalance?: InputMaybe<Scalars['Float']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  data?: InputMaybe<Scalars['Iterable']['input']>;
  dateFrom?: InputMaybe<Scalars['String']['input']>;
  dateTo?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  denominations?: InputMaybe<Scalars['Iterable']['input']>;
  expenses?: InputMaybe<Scalars['Float']['input']>;
  openedBy?: InputMaybe<Scalars['String']['input']>;
  openingBalance?: InputMaybe<Scalars['Float']['input']>;
  store?: InputMaybe<Scalars['String']['input']>;
  terminal?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type CreateClosingPayload = {
  __typename?: 'createClosingPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  closing?: Maybe<Closing>;
};

export type CreateCustomerInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  birthday?: InputMaybe<Scalars['String']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  cnic?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  lat?: InputMaybe<Scalars['Float']['input']>;
  lng?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  openingBalance?: InputMaybe<Scalars['String']['input']>;
  orders?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  payments?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  phone?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type CreateCustomerPayload = {
  __typename?: 'createCustomerPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  customer?: Maybe<Customer>;
};

export type CreateCustomerPaymentInput = {
  amount: Scalars['String']['input'];
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  customer: Scalars['String']['input'];
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type CreateCustomerPaymentPayload = {
  __typename?: 'createCustomerPaymentPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  customerPayment?: Maybe<CustomerPayment>;
};

export type CreateDepartmentInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  store?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type CreateDepartmentPayload = {
  __typename?: 'createDepartmentPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  department?: Maybe<Department>;
};

export type CreateDeviceInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  ipAddress: Scalars['String']['input'];
  name: Scalars['String']['input'];
  port: Scalars['Int']['input'];
  prints: Scalars['Int']['input'];
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type CreateDevicePayload = {
  __typename?: 'createDevicePayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  device?: Maybe<Device>;
};

export type CreateDiscountInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  rate?: InputMaybe<Scalars['String']['input']>;
  rateType?: InputMaybe<Scalars['String']['input']>;
  scope?: InputMaybe<Scalars['String']['input']>;
  stores?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type CreateDiscountPayload = {
  __typename?: 'createDiscountPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  discount?: Maybe<Discount>;
};

export type CreateExpenseInput = {
  amount: Scalars['String']['input'];
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  store?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  user: Scalars['String']['input'];
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type CreateExpensePayload = {
  __typename?: 'createExpensePayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  expense?: Maybe<Expense>;
};

export type CreateLocationInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type CreateLocationPayload = {
  __typename?: 'createLocationPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  location?: Maybe<Location>;
};

export type CreateMediaInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  extension?: InputMaybe<Scalars['String']['input']>;
  mimeType?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  originalName: Scalars['String']['input'];
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type CreateMediaPayload = {
  __typename?: 'createMediaPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  media?: Maybe<Media>;
};

export type CreateOrderDiscountInput = {
  amount: Scalars['String']['input'];
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['String']['input']>;
  rate?: InputMaybe<Scalars['String']['input']>;
  rateType?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
};

export type CreateOrderDiscountPayload = {
  __typename?: 'createOrderDiscountPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  orderDiscount?: Maybe<OrderDiscount>;
};

export type CreateOrderInput = {
  adjustment?: InputMaybe<Scalars['String']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  customer?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  discount?: InputMaybe<Scalars['String']['input']>;
  isDeleted?: InputMaybe<Scalars['Boolean']['input']>;
  isDispatched?: InputMaybe<Scalars['Boolean']['input']>;
  isReturned?: InputMaybe<Scalars['Boolean']['input']>;
  isSuspended?: InputMaybe<Scalars['Boolean']['input']>;
  items?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  orderId?: InputMaybe<Scalars['Int']['input']>;
  payments?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  returnedFrom?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  store?: InputMaybe<Scalars['String']['input']>;
  tax?: InputMaybe<Scalars['String']['input']>;
  terminal?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  user?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type CreateOrderPayload = {
  __typename?: 'createOrderPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Order>;
};

export type CreateOrderPaymentInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  due: Scalars['String']['input'];
  order?: InputMaybe<Scalars['String']['input']>;
  received: Scalars['String']['input'];
  total: Scalars['String']['input'];
  type?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
};

export type CreateOrderPaymentPayload = {
  __typename?: 'createOrderPaymentPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  orderPayment?: Maybe<OrderPayment>;
};

export type CreateOrderProductInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  discount?: InputMaybe<Scalars['String']['input']>;
  isDeleted?: InputMaybe<Scalars['Boolean']['input']>;
  isReturned?: InputMaybe<Scalars['Boolean']['input']>;
  isSuspended?: InputMaybe<Scalars['Boolean']['input']>;
  order?: InputMaybe<Scalars['String']['input']>;
  price: Scalars['String']['input'];
  product: Scalars['String']['input'];
  quantity: Scalars['String']['input'];
  taxes?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  variant?: InputMaybe<Scalars['String']['input']>;
};

export type CreateOrderProductPayload = {
  __typename?: 'createOrderProductPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  orderProduct?: Maybe<OrderProduct>;
};

export type CreateOrderTaxInput = {
  amount: Scalars['String']['input'];
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['String']['input']>;
  rate: Scalars['String']['input'];
  type?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
};

export type CreateOrderTaxPayload = {
  __typename?: 'createOrderTaxPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  orderTax?: Maybe<OrderTax>;
};

export type CreatePaymentInput = {
  canHaveChangeDue?: InputMaybe<Scalars['Boolean']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  stores?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type: Scalars['String']['input'];
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type CreatePaymentPayload = {
  __typename?: 'createPaymentPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  payment?: Maybe<Payment>;
};

export type CreateProductInput = {
  barcode?: InputMaybe<Scalars['String']['input']>;
  basePrice?: InputMaybe<Scalars['String']['input']>;
  baseQuantity?: InputMaybe<Scalars['Int']['input']>;
  brands?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  categories?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  cost?: InputMaybe<Scalars['String']['input']>;
  department?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isAvailable?: InputMaybe<Scalars['Boolean']['input']>;
  manageInventory?: InputMaybe<Scalars['Boolean']['input']>;
  media?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  prices?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  purchaseUnit?: InputMaybe<Scalars['String']['input']>;
  quantity?: InputMaybe<Scalars['String']['input']>;
  saleUnit?: InputMaybe<Scalars['String']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  suppliers?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  taxes?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  terminals?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  variants?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type CreateProductInventoryInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  entity?: InputMaybe<Scalars['String']['input']>;
  entityType?: InputMaybe<Scalars['String']['input']>;
  product: Scalars['String']['input'];
  quantity: Scalars['Float']['input'];
};

export type CreateProductInventoryPayload = {
  __typename?: 'createProductInventoryPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  productInventory?: Maybe<ProductInventory>;
};

export type CreateProductPayload = {
  __typename?: 'createProductPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  product?: Maybe<Product>;
};

export type CreateProductPriceInput = {
  basePrice: Scalars['String']['input'];
  baseQuantity?: InputMaybe<Scalars['String']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['Int']['input']>;
  day?: InputMaybe<Scalars['Int']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  maxQuantity?: InputMaybe<Scalars['String']['input']>;
  minQuantity?: InputMaybe<Scalars['String']['input']>;
  month?: InputMaybe<Scalars['Int']['input']>;
  product: Scalars['String']['input'];
  productVariant?: InputMaybe<Scalars['String']['input']>;
  quarter?: InputMaybe<Scalars['Int']['input']>;
  rate?: InputMaybe<Scalars['String']['input']>;
  time?: InputMaybe<Scalars['String']['input']>;
  timeTo?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
  week?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateProductPricePayload = {
  __typename?: 'createProductPricePayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  productPrice?: Maybe<ProductPrice>;
};

export type CreateProductVariantInput = {
  attributeName?: InputMaybe<Scalars['String']['input']>;
  attributeValue?: InputMaybe<Scalars['String']['input']>;
  barcode?: InputMaybe<Scalars['String']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['String']['input']>;
  prices?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  product?: InputMaybe<Scalars['String']['input']>;
  quantity?: InputMaybe<Scalars['String']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type CreateProductVariantPayload = {
  __typename?: 'createProductVariantPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  productVariant?: Maybe<ProductVariant>;
};

export type CreatePurchaseInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  items?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  paymentType?: InputMaybe<Scalars['String']['input']>;
  purchaseMode?: InputMaybe<Scalars['String']['input']>;
  purchaseNumber?: InputMaybe<Scalars['String']['input']>;
  purchaseOrder?: InputMaybe<Scalars['String']['input']>;
  purchasedBy: Scalars['String']['input'];
  store: Scalars['String']['input'];
  supplier?: InputMaybe<Scalars['String']['input']>;
  updatePrice?: InputMaybe<Scalars['Boolean']['input']>;
  updateStocks?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CreatePurchaseItemInput = {
  barcode?: InputMaybe<Scalars['String']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  comments?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  item: Scalars['String']['input'];
  purchase: Scalars['String']['input'];
  purchasePrice: Scalars['String']['input'];
  purchaseUnit?: InputMaybe<Scalars['String']['input']>;
  quantity: Scalars['String']['input'];
  quantityRequested?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
  variants?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type CreatePurchaseItemPayload = {
  __typename?: 'createPurchaseItemPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  purchaseItem?: Maybe<PurchaseItem>;
};

export type CreatePurchaseItemVariantInput = {
  barcode?: InputMaybe<Scalars['String']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  comments?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  purchaseItem: Scalars['String']['input'];
  purchasePrice: Scalars['String']['input'];
  purchaseUnit?: InputMaybe<Scalars['String']['input']>;
  quantity: Scalars['String']['input'];
  quantityRequested?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
  variant: Scalars['String']['input'];
};

export type CreatePurchaseItemVariantPayload = {
  __typename?: 'createPurchaseItemVariantPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  purchaseItemVariant?: Maybe<PurchaseItemVariant>;
};

export type CreatePurchaseOrderInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  isUsed?: InputMaybe<Scalars['Boolean']['input']>;
  items?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  poNumber?: InputMaybe<Scalars['String']['input']>;
  store: Scalars['String']['input'];
  supplier: Scalars['String']['input'];
};

export type CreatePurchaseOrderItemInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  comments?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  item: Scalars['String']['input'];
  price: Scalars['String']['input'];
  purchaseOrder: Scalars['String']['input'];
  quantity: Scalars['String']['input'];
  unit?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
  variants?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type CreatePurchaseOrderItemPayload = {
  __typename?: 'createPurchaseOrderItemPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  purchaseOrderItem?: Maybe<PurchaseOrderItem>;
};

export type CreatePurchaseOrderItemVariantInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  comments?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  purchaseOrderItem: Scalars['String']['input'];
  purchasePrice: Scalars['String']['input'];
  purchaseUnit?: InputMaybe<Scalars['String']['input']>;
  quantity: Scalars['String']['input'];
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
  variant: Scalars['String']['input'];
};

export type CreatePurchaseOrderItemVariantPayload = {
  __typename?: 'createPurchaseOrderItemVariantPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  purchaseOrderItemVariant?: Maybe<PurchaseOrderItemVariant>;
};

export type CreatePurchaseOrderPayload = {
  __typename?: 'createPurchaseOrderPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  purchaseOrder?: Maybe<PurchaseOrder>;
};

export type CreatePurchasePayload = {
  __typename?: 'createPurchasePayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  purchase?: Maybe<Purchase>;
};

export type CreateSettingInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  type?: InputMaybe<Scalars['String']['input']>;
  user?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

export type CreateSettingPayload = {
  __typename?: 'createSettingPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  setting?: Maybe<Setting>;
};

export type CreateStoreInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  terminals?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type CreateStorePayload = {
  __typename?: 'createStorePayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  store?: Maybe<Store>;
};

export type CreateSupplierInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  fax?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  media?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  openingBalance?: InputMaybe<Scalars['String']['input']>;
  payments?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  phone?: InputMaybe<Scalars['String']['input']>;
  purchaseOrders?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  purchases?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  stores?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
  whatsApp?: InputMaybe<Scalars['String']['input']>;
};

export type CreateSupplierPayload = {
  __typename?: 'createSupplierPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  supplier?: Maybe<Supplier>;
};

export type CreateSupplierPaymentInput = {
  amount: Scalars['String']['input'];
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  purchase?: InputMaybe<Scalars['String']['input']>;
  supplier: Scalars['String']['input'];
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type CreateSupplierPaymentPayload = {
  __typename?: 'createSupplierPaymentPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  supplierPayment?: Maybe<SupplierPayment>;
};

export type CreateTaxInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  rate: Scalars['String']['input'];
  stores?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type CreateTaxPayload = {
  __typename?: 'createTaxPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  tax?: Maybe<Tax>;
};

export type CreateTerminalInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  code: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  products?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  store?: InputMaybe<Scalars['String']['input']>;
};

export type CreateTerminalPayload = {
  __typename?: 'createTerminalPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  terminal?: Maybe<Terminal>;
};

export type CreateUserInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  displayName: Scalars['String']['input'];
  email?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  password: Scalars['String']['input'];
  passwordResetToken?: InputMaybe<Scalars['String']['input']>;
  plainPassword?: InputMaybe<Scalars['String']['input']>;
  roles: Scalars['Iterable']['input'];
  salt: Scalars['String']['input'];
  settings?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  stores?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  username: Scalars['String']['input'];
  uuid?: InputMaybe<Scalars['String']['input']>;
  verificationToken?: InputMaybe<Scalars['String']['input']>;
};

export type CreateUserPayload = {
  __typename?: 'createUserPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
};

export type DeleteBarcodeInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteBarcodePayload = {
  __typename?: 'deleteBarcodePayload';
  barcode?: Maybe<Barcode>;
  clientMutationId?: Maybe<Scalars['String']['output']>;
};

export type DeleteBrandInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteBrandPayload = {
  __typename?: 'deleteBrandPayload';
  brand?: Maybe<Brand>;
  clientMutationId?: Maybe<Scalars['String']['output']>;
};

export type DeleteCategoryInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteCategoryPayload = {
  __typename?: 'deleteCategoryPayload';
  category?: Maybe<Category>;
  clientMutationId?: Maybe<Scalars['String']['output']>;
};

export type DeleteClosingInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteClosingPayload = {
  __typename?: 'deleteClosingPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  closing?: Maybe<Closing>;
};

export type DeleteCustomerInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteCustomerPayload = {
  __typename?: 'deleteCustomerPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  customer?: Maybe<Customer>;
};

export type DeleteCustomerPaymentInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteCustomerPaymentPayload = {
  __typename?: 'deleteCustomerPaymentPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  customerPayment?: Maybe<CustomerPayment>;
};

export type DeleteDepartmentInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteDepartmentPayload = {
  __typename?: 'deleteDepartmentPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  department?: Maybe<Department>;
};

export type DeleteDeviceInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteDevicePayload = {
  __typename?: 'deleteDevicePayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  device?: Maybe<Device>;
};

export type DeleteDiscountInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteDiscountPayload = {
  __typename?: 'deleteDiscountPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  discount?: Maybe<Discount>;
};

export type DeleteExpenseInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteExpensePayload = {
  __typename?: 'deleteExpensePayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  expense?: Maybe<Expense>;
};

export type DeleteLocationInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteLocationPayload = {
  __typename?: 'deleteLocationPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  location?: Maybe<Location>;
};

export type DeleteMediaInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteMediaPayload = {
  __typename?: 'deleteMediaPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  media?: Maybe<Media>;
};

export type DeleteOrderDiscountInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteOrderDiscountPayload = {
  __typename?: 'deleteOrderDiscountPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  orderDiscount?: Maybe<OrderDiscount>;
};

export type DeleteOrderInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteOrderPayload = {
  __typename?: 'deleteOrderPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Order>;
};

export type DeleteOrderPaymentInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteOrderPaymentPayload = {
  __typename?: 'deleteOrderPaymentPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  orderPayment?: Maybe<OrderPayment>;
};

export type DeleteOrderProductInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteOrderProductPayload = {
  __typename?: 'deleteOrderProductPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  orderProduct?: Maybe<OrderProduct>;
};

export type DeleteOrderTaxInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteOrderTaxPayload = {
  __typename?: 'deleteOrderTaxPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  orderTax?: Maybe<OrderTax>;
};

export type DeletePaymentInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeletePaymentPayload = {
  __typename?: 'deletePaymentPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  payment?: Maybe<Payment>;
};

export type DeleteProductInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteProductInventoryInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteProductInventoryPayload = {
  __typename?: 'deleteProductInventoryPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  productInventory?: Maybe<ProductInventory>;
};

export type DeleteProductPayload = {
  __typename?: 'deleteProductPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  product?: Maybe<Product>;
};

export type DeleteProductPriceInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteProductPricePayload = {
  __typename?: 'deleteProductPricePayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  productPrice?: Maybe<ProductPrice>;
};

export type DeleteProductVariantInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteProductVariantPayload = {
  __typename?: 'deleteProductVariantPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  productVariant?: Maybe<ProductVariant>;
};

export type DeletePurchaseInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeletePurchaseItemInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeletePurchaseItemPayload = {
  __typename?: 'deletePurchaseItemPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  purchaseItem?: Maybe<PurchaseItem>;
};

export type DeletePurchaseItemVariantInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeletePurchaseItemVariantPayload = {
  __typename?: 'deletePurchaseItemVariantPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  purchaseItemVariant?: Maybe<PurchaseItemVariant>;
};

export type DeletePurchaseOrderInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeletePurchaseOrderItemInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeletePurchaseOrderItemPayload = {
  __typename?: 'deletePurchaseOrderItemPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  purchaseOrderItem?: Maybe<PurchaseOrderItem>;
};

export type DeletePurchaseOrderItemVariantInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeletePurchaseOrderItemVariantPayload = {
  __typename?: 'deletePurchaseOrderItemVariantPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  purchaseOrderItemVariant?: Maybe<PurchaseOrderItemVariant>;
};

export type DeletePurchaseOrderPayload = {
  __typename?: 'deletePurchaseOrderPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  purchaseOrder?: Maybe<PurchaseOrder>;
};

export type DeletePurchasePayload = {
  __typename?: 'deletePurchasePayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  purchase?: Maybe<Purchase>;
};

export type DeleteSettingInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteSettingPayload = {
  __typename?: 'deleteSettingPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  setting?: Maybe<Setting>;
};

export type DeleteStoreInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteStorePayload = {
  __typename?: 'deleteStorePayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  store?: Maybe<Store>;
};

export type DeleteSupplierInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteSupplierPayload = {
  __typename?: 'deleteSupplierPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  supplier?: Maybe<Supplier>;
};

export type DeleteSupplierPaymentInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteSupplierPaymentPayload = {
  __typename?: 'deleteSupplierPaymentPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  supplierPayment?: Maybe<SupplierPayment>;
};

export type DeleteTaxInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteTaxPayload = {
  __typename?: 'deleteTaxPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  tax?: Maybe<Tax>;
};

export type DeleteTerminalInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteTerminalPayload = {
  __typename?: 'deleteTerminalPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  terminal?: Maybe<Terminal>;
};

export type DeleteUserInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteUserPayload = {
  __typename?: 'deleteUserPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
};

export type UpdateBarcodeInput = {
  barcode?: InputMaybe<Scalars['String']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  item?: InputMaybe<Scalars['String']['input']>;
  measurement?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['String']['input']>;
  unit?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  usages?: InputMaybe<Scalars['Int']['input']>;
  used?: InputMaybe<Scalars['Int']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
  variant?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateBarcodePayload = {
  __typename?: 'updateBarcodePayload';
  barcode?: Maybe<Barcode>;
  clientMutationId?: Maybe<Scalars['String']['output']>;
};

export type UpdateBrandInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  media?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  stores?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateBrandPayload = {
  __typename?: 'updateBrandPayload';
  brand?: Maybe<Brand>;
  clientMutationId?: Maybe<Scalars['String']['output']>;
};

export type UpdateCategoryInput = {
  children?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  parent?: InputMaybe<Scalars['String']['input']>;
  stores?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCategoryPayload = {
  __typename?: 'updateCategoryPayload';
  category?: Maybe<Category>;
  clientMutationId?: Maybe<Scalars['String']['output']>;
};

export type UpdateClosingInput = {
  cashAdded?: InputMaybe<Scalars['Float']['input']>;
  cashWithdrawn?: InputMaybe<Scalars['Float']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  closedAt?: InputMaybe<Scalars['String']['input']>;
  closedBy?: InputMaybe<Scalars['String']['input']>;
  closingBalance?: InputMaybe<Scalars['Float']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  data?: InputMaybe<Scalars['Iterable']['input']>;
  dateFrom?: InputMaybe<Scalars['String']['input']>;
  dateTo?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  denominations?: InputMaybe<Scalars['Iterable']['input']>;
  expenses?: InputMaybe<Scalars['Float']['input']>;
  id: Scalars['ID']['input'];
  openedBy?: InputMaybe<Scalars['String']['input']>;
  openingBalance?: InputMaybe<Scalars['Float']['input']>;
  store?: InputMaybe<Scalars['String']['input']>;
  terminal?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateClosingPayload = {
  __typename?: 'updateClosingPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  closing?: Maybe<Closing>;
};

export type UpdateCustomerInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  birthday?: InputMaybe<Scalars['String']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  cnic?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  lat?: InputMaybe<Scalars['Float']['input']>;
  lng?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  openingBalance?: InputMaybe<Scalars['String']['input']>;
  orders?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  payments?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  phone?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCustomerPayload = {
  __typename?: 'updateCustomerPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  customer?: Maybe<Customer>;
};

export type UpdateCustomerPaymentInput = {
  amount?: InputMaybe<Scalars['String']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  customer?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  order?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCustomerPaymentPayload = {
  __typename?: 'updateCustomerPaymentPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  customerPayment?: Maybe<CustomerPayment>;
};

export type UpdateDepartmentInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  store?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateDepartmentPayload = {
  __typename?: 'updateDepartmentPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  department?: Maybe<Department>;
};

export type UpdateDeviceInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  ipAddress?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  port?: InputMaybe<Scalars['Int']['input']>;
  prints?: InputMaybe<Scalars['Int']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateDevicePayload = {
  __typename?: 'updateDevicePayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  device?: Maybe<Device>;
};

export type UpdateDiscountInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  rate?: InputMaybe<Scalars['String']['input']>;
  rateType?: InputMaybe<Scalars['String']['input']>;
  scope?: InputMaybe<Scalars['String']['input']>;
  stores?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateDiscountPayload = {
  __typename?: 'updateDiscountPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  discount?: Maybe<Discount>;
};

export type UpdateExpenseInput = {
  amount?: InputMaybe<Scalars['String']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  store?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  user?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateExpensePayload = {
  __typename?: 'updateExpensePayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  expense?: Maybe<Expense>;
};

export type UpdateLocationInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateLocationPayload = {
  __typename?: 'updateLocationPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  location?: Maybe<Location>;
};

export type UpdateMediaInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  extension?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  mimeType?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  originalName?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMediaPayload = {
  __typename?: 'updateMediaPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  media?: Maybe<Media>;
};

export type UpdateOrderDiscountInput = {
  amount?: InputMaybe<Scalars['String']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  order?: InputMaybe<Scalars['String']['input']>;
  rate?: InputMaybe<Scalars['String']['input']>;
  rateType?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrderDiscountPayload = {
  __typename?: 'updateOrderDiscountPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  orderDiscount?: Maybe<OrderDiscount>;
};

export type UpdateOrderInput = {
  adjustment?: InputMaybe<Scalars['String']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  customer?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  discount?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isDeleted?: InputMaybe<Scalars['Boolean']['input']>;
  isDispatched?: InputMaybe<Scalars['Boolean']['input']>;
  isReturned?: InputMaybe<Scalars['Boolean']['input']>;
  isSuspended?: InputMaybe<Scalars['Boolean']['input']>;
  items?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  orderId?: InputMaybe<Scalars['Int']['input']>;
  payments?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  returnedFrom?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  store?: InputMaybe<Scalars['String']['input']>;
  tax?: InputMaybe<Scalars['String']['input']>;
  terminal?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  user?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrderPayload = {
  __typename?: 'updateOrderPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  order?: Maybe<Order>;
};

export type UpdateOrderPaymentInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  due?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  order?: InputMaybe<Scalars['String']['input']>;
  received?: InputMaybe<Scalars['String']['input']>;
  total?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrderPaymentPayload = {
  __typename?: 'updateOrderPaymentPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  orderPayment?: Maybe<OrderPayment>;
};

export type UpdateOrderProductInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  discount?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isDeleted?: InputMaybe<Scalars['Boolean']['input']>;
  isReturned?: InputMaybe<Scalars['Boolean']['input']>;
  isSuspended?: InputMaybe<Scalars['Boolean']['input']>;
  order?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['String']['input']>;
  product?: InputMaybe<Scalars['String']['input']>;
  quantity?: InputMaybe<Scalars['String']['input']>;
  taxes?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  variant?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrderProductPayload = {
  __typename?: 'updateOrderProductPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  orderProduct?: Maybe<OrderProduct>;
};

export type UpdateOrderTaxInput = {
  amount?: InputMaybe<Scalars['String']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  order?: InputMaybe<Scalars['String']['input']>;
  rate?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrderTaxPayload = {
  __typename?: 'updateOrderTaxPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  orderTax?: Maybe<OrderTax>;
};

export type UpdatePaymentInput = {
  canHaveChangeDue?: InputMaybe<Scalars['Boolean']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  stores?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePaymentPayload = {
  __typename?: 'updatePaymentPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  payment?: Maybe<Payment>;
};

export type UpdateProductInput = {
  barcode?: InputMaybe<Scalars['String']['input']>;
  basePrice?: InputMaybe<Scalars['String']['input']>;
  baseQuantity?: InputMaybe<Scalars['Int']['input']>;
  brands?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  categories?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  cost?: InputMaybe<Scalars['String']['input']>;
  department?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isAvailable?: InputMaybe<Scalars['Boolean']['input']>;
  manageInventory?: InputMaybe<Scalars['Boolean']['input']>;
  media?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  prices?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  purchaseUnit?: InputMaybe<Scalars['String']['input']>;
  quantity?: InputMaybe<Scalars['String']['input']>;
  saleUnit?: InputMaybe<Scalars['String']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  suppliers?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  taxes?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  terminals?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  variants?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type UpdateProductInventoryInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  entity?: InputMaybe<Scalars['String']['input']>;
  entityType?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  product?: InputMaybe<Scalars['String']['input']>;
  quantity?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateProductInventoryPayload = {
  __typename?: 'updateProductInventoryPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  productInventory?: Maybe<ProductInventory>;
};

export type UpdateProductPayload = {
  __typename?: 'updateProductPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  product?: Maybe<Product>;
};

export type UpdateProductPriceInput = {
  basePrice?: InputMaybe<Scalars['String']['input']>;
  baseQuantity?: InputMaybe<Scalars['String']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['Int']['input']>;
  day?: InputMaybe<Scalars['Int']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  maxQuantity?: InputMaybe<Scalars['String']['input']>;
  minQuantity?: InputMaybe<Scalars['String']['input']>;
  month?: InputMaybe<Scalars['Int']['input']>;
  product?: InputMaybe<Scalars['String']['input']>;
  productVariant?: InputMaybe<Scalars['String']['input']>;
  quarter?: InputMaybe<Scalars['Int']['input']>;
  rate?: InputMaybe<Scalars['String']['input']>;
  time?: InputMaybe<Scalars['String']['input']>;
  timeTo?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
  week?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateProductPricePayload = {
  __typename?: 'updateProductPricePayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  productPrice?: Maybe<ProductPrice>;
};

export type UpdateProductVariantInput = {
  attributeName?: InputMaybe<Scalars['String']['input']>;
  attributeValue?: InputMaybe<Scalars['String']['input']>;
  barcode?: InputMaybe<Scalars['String']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['String']['input']>;
  prices?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  product?: InputMaybe<Scalars['String']['input']>;
  quantity?: InputMaybe<Scalars['String']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProductVariantPayload = {
  __typename?: 'updateProductVariantPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  productVariant?: Maybe<ProductVariant>;
};

export type UpdatePurchaseInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  items?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  paymentType?: InputMaybe<Scalars['String']['input']>;
  purchaseMode?: InputMaybe<Scalars['String']['input']>;
  purchaseNumber?: InputMaybe<Scalars['String']['input']>;
  purchaseOrder?: InputMaybe<Scalars['String']['input']>;
  purchasedBy?: InputMaybe<Scalars['String']['input']>;
  store?: InputMaybe<Scalars['String']['input']>;
  supplier?: InputMaybe<Scalars['String']['input']>;
  updatePrice?: InputMaybe<Scalars['Boolean']['input']>;
  updateStocks?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdatePurchaseItemInput = {
  barcode?: InputMaybe<Scalars['String']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  comments?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  item?: InputMaybe<Scalars['String']['input']>;
  purchase?: InputMaybe<Scalars['String']['input']>;
  purchasePrice?: InputMaybe<Scalars['String']['input']>;
  purchaseUnit?: InputMaybe<Scalars['String']['input']>;
  quantity?: InputMaybe<Scalars['String']['input']>;
  quantityRequested?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
  variants?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type UpdatePurchaseItemPayload = {
  __typename?: 'updatePurchaseItemPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  purchaseItem?: Maybe<PurchaseItem>;
};

export type UpdatePurchaseItemVariantInput = {
  barcode?: InputMaybe<Scalars['String']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  comments?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  purchaseItem?: InputMaybe<Scalars['String']['input']>;
  purchasePrice?: InputMaybe<Scalars['String']['input']>;
  purchaseUnit?: InputMaybe<Scalars['String']['input']>;
  quantity?: InputMaybe<Scalars['String']['input']>;
  quantityRequested?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
  variant?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePurchaseItemVariantPayload = {
  __typename?: 'updatePurchaseItemVariantPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  purchaseItemVariant?: Maybe<PurchaseItemVariant>;
};

export type UpdatePurchaseOrderInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isUsed?: InputMaybe<Scalars['Boolean']['input']>;
  items?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  poNumber?: InputMaybe<Scalars['String']['input']>;
  store?: InputMaybe<Scalars['String']['input']>;
  supplier?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePurchaseOrderItemInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  comments?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  item?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['String']['input']>;
  purchaseOrder?: InputMaybe<Scalars['String']['input']>;
  quantity?: InputMaybe<Scalars['String']['input']>;
  unit?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
  variants?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type UpdatePurchaseOrderItemPayload = {
  __typename?: 'updatePurchaseOrderItemPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  purchaseOrderItem?: Maybe<PurchaseOrderItem>;
};

export type UpdatePurchaseOrderItemVariantInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  comments?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  purchaseOrderItem?: InputMaybe<Scalars['String']['input']>;
  purchasePrice?: InputMaybe<Scalars['String']['input']>;
  purchaseUnit?: InputMaybe<Scalars['String']['input']>;
  quantity?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
  variant?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePurchaseOrderItemVariantPayload = {
  __typename?: 'updatePurchaseOrderItemVariantPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  purchaseOrderItemVariant?: Maybe<PurchaseOrderItemVariant>;
};

export type UpdatePurchaseOrderPayload = {
  __typename?: 'updatePurchaseOrderPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  purchaseOrder?: Maybe<PurchaseOrder>;
};

export type UpdatePurchasePayload = {
  __typename?: 'updatePurchasePayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  purchase?: Maybe<Purchase>;
};

export type UpdateSettingInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  user?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSettingPayload = {
  __typename?: 'updateSettingPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  setting?: Maybe<Setting>;
};

export type UpdateStoreInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  terminals?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateStorePayload = {
  __typename?: 'updateStorePayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  store?: Maybe<Store>;
};

export type UpdateSupplierInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  fax?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  media?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  openingBalance?: InputMaybe<Scalars['String']['input']>;
  payments?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  phone?: InputMaybe<Scalars['String']['input']>;
  purchaseOrders?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  purchases?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  stores?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
  whatsApp?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSupplierPayload = {
  __typename?: 'updateSupplierPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  supplier?: Maybe<Supplier>;
};

export type UpdateSupplierPaymentInput = {
  amount?: InputMaybe<Scalars['String']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  purchase?: InputMaybe<Scalars['String']['input']>;
  supplier?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSupplierPaymentPayload = {
  __typename?: 'updateSupplierPaymentPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  supplierPayment?: Maybe<SupplierPayment>;
};

export type UpdateTaxInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  rate?: InputMaybe<Scalars['String']['input']>;
  stores?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTaxPayload = {
  __typename?: 'updateTaxPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  tax?: Maybe<Tax>;
};

export type UpdateTerminalInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  products?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  store?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTerminalPayload = {
  __typename?: 'updateTerminalPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  terminal?: Maybe<Terminal>;
};

export type UpdateUserInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  passwordResetToken?: InputMaybe<Scalars['String']['input']>;
  plainPassword?: InputMaybe<Scalars['String']['input']>;
  roles?: InputMaybe<Scalars['Iterable']['input']>;
  salt?: InputMaybe<Scalars['String']['input']>;
  settings?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  stores?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
  verificationToken?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserPayload = {
  __typename?: 'updateUserPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
};

export type GetTerminalsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTerminalsQuery = { __typename?: 'Query', terminals?: { __typename?: 'TerminalCursorConnection', edges?: Array<{ __typename?: 'TerminalEdge', node?: { __typename?: 'Terminal', _id: number, id: string, code: string, description?: string | null, products?: { __typename?: 'ProductCursorConnection', edges?: Array<{ __typename?: 'ProductEdge', node?: { __typename?: 'Product', name: string, department?: { __typename?: 'Department', name: string } | null, taxes?: { __typename?: 'TaxCursorConnection', edges?: Array<{ __typename?: 'TaxEdge', node?: { __typename?: 'Tax', _id: number, id: string, name: string } | null } | null> | null } | null } | null } | null> | null } | null } | null } | null> | null } | null };


export const GetTerminalsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTerminals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"terminals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"department"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"_id"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetTerminalsQuery, GetTerminalsQueryVariables>;