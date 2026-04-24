export type Category = {
  id: number;
  name: string;
};

// Common
export type UUID = string;

// Login
export interface LoginRequestDTO {
  username: string;
  password: string;
}

export interface LoginResponseDTO {
  token: string;
}

// Register
export interface RegisterRequestDTO {
  username: string;
  name: string;
  surname: string;
  email: string;
  password: string;
}

// Product card
export interface ProductCardDTO {
  id: UUID;
  name: string;
  category: string;
  price: number;
  stock: number;
  active: boolean;
  imageUrl: string | null;
  rating: number;
}

export interface CartDTO {
  cartId: UUID;
  userId: UUID | null;
  guestToken: string | null;
  guestCart: boolean;
  canCheckout: boolean;
  items: CartItemDTO[];
  totalPrice: number;
}


export interface CartItemDTO {
  productId: UUID;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface CartItemRequestDTO {
  productId: UUID;
  quantity: number;
}

export interface CartMergeRequestDTO {
  guestToken: string;
  userId: UUID;
}

export interface EnrichedCartItem extends CartItemDTO {
  imageUrl: string | null;
  category: string | null;
  stock: number | null;
}

export interface ProductDetailedDTO {
  id: UUID;
  name: string;
  model: string | null;
  serialNumber: string | null;
  category: string;
  price: number;
  rating: number;
  image: string | null;
  extraImages: string[] | null;
  description: string | null;
  features: string[] | null;
  stock: number;
  warrantyStatus: string | null;
  distributorName: string | null;
  distributorContact: string | null;
  distributorAddress: string | null;
  distributorEmail: string | null;
}

// Search query params for GET /api/products/search
export interface ProductSearchParams {
  name: string;
  page?: number;
}

export type Product = {
  // From product_page (canonical base)
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  image: string;
  images: string[];
  description: string;
  features: string[];
  stock: number;
  // From pm_admin
  categoryId: number;
  active: boolean;
  // New for SM admin
  cost: number;
  discountRate: number;
  discountedPrice: number;
};

export type Comment = {
  id: number;
  productId: number;
  author: string;
  text: string;
  rating: number;
  status: "pending" | "approved" | "rejected";
  date: string;
};

export type Delivery = {
  deliveryId: string;
  customerId: string;
  productId: number;
  quantity: number;
  totalPrice: number;
  address: string;
  addressDetail: string;
  completed: boolean;
  status: "completed" | "in-transit" | "preparing" | "delayed";
};

export type Invoice = {
  invoiceId: string;
  customerId: string;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  date: string;
  paid: boolean;
};

export type WishlistEntry = {
  userId: string;
  email: string;
  productId: number;
};


export interface InvoiceItemDTO {
  productId: UUID;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface InvoiceDTO {
  invoiceId: UUID;
  customerId: UUID;
  items: InvoiceItemDTO[];
  totalPrice: number;
  date: string;
}