export type Category = {
  id: number;
  name: string;
};

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
