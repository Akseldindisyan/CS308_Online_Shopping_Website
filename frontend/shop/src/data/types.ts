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

// Product card (matches backend ProductCardDTO)
export interface ProductCardDTO {
  id: UUID;
  name: string;
  categoryId: number | null;
  price: number;
  stock: number;
  active: boolean;
  imageUrl: string | null;
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
  status: "delivered" | "in-transit" | "processing";
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
