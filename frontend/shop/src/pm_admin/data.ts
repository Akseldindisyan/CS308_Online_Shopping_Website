export type Category = {
  id: number;
  name: string;
};

export type Product = {
  id: number;
  name: string;
  categoryId: number;
  price: number;
  stock: number;
  active: boolean;
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

export const initCategories: Category[] = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Clothing" },
  { id: 3, name: "Books" },
  { id: 4, name: "Accessories" },
];

export const initProducts: Product[] = [
  { id: 1, name: "Bluetooth Headphones", categoryId: 1, price: 450, stock: 34, active: true },
  { id: 2, name: "Mechanical Keyboard", categoryId: 1, price: 890, stock: 7, active: true },
  { id: 3, name: "Cotton T-Shirt", categoryId: 2, price: 120, stock: 80, active: true },
  { id: 4, name: "Leather Wallet", categoryId: 4, price: 220, stock: 12, active: true },
  { id: 5, name: "React Handbook", categoryId: 3, price: 75, stock: 50, active: true },
  { id: 6, name: "Wireless Mouse", categoryId: 1, price: 310, stock: 5, active: false },
];

export const initComments: Comment[] = [
  { id: 1, productId: 1, author: "Alice M.", text: "Sound quality is excellent, packaging was great too.", rating: 5, status: "pending", date: "Mar 23, 2026" },
  { id: 2, productId: 2, author: "Bob T.", text: "Key feel is fantastic but it can be noisy.", rating: 4, status: "pending", date: "Mar 23, 2026" },
  { id: 3, productId: 4, author: "Carol W.", text: "Quality was lower than expected, I returned it.", rating: 2, status: "pending", date: "Mar 22, 2026" },
  { id: 4, productId: 3, author: "David K.", text: "Fits perfectly, very comfortable fabric.", rating: 5, status: "approved", date: "Mar 21, 2026" },
  { id: 5, productId: 5, author: "Emma L.", text: "Very well written, great for beginners.", rating: 5, status: "approved", date: "Mar 20, 2026" },
  { id: 6, productId: 1, author: "Frank O.", text: "Battery life could be better but overall good.", rating: 3, status: "rejected", date: "Mar 19, 2026" },
];

export const initDeliveries: Delivery[] = [
  { deliveryId: "DLV-001", customerId: "USR-2841", productId: 1, quantity: 2, totalPrice: 900, address: "Kadıköy, Istanbul", addressDetail: "Moda Cad. No:14 D:3", completed: true, status: "completed" },
  { deliveryId: "DLV-002", customerId: "USR-1033", productId: 3, quantity: 3, totalPrice: 360, address: "Çankaya, Ankara", addressDetail: "Tunalı Hilmi Cad. 47/5", completed: false, status: "in-transit" },
  { deliveryId: "DLV-003", customerId: "USR-5512", productId: 2, quantity: 1, totalPrice: 890, address: "Konak, Izmir", addressDetail: "Alsancak Mah. 1380 Sk.", completed: false, status: "preparing" },
  { deliveryId: "DLV-004", customerId: "USR-7790", productId: 4, quantity: 1, totalPrice: 220, address: "Nilüfer, Bursa", addressDetail: "Özlüce Mah. Güzelyurt Sk.", completed: false, status: "delayed" },
  { deliveryId: "DLV-005", customerId: "USR-3301", productId: 5, quantity: 2, totalPrice: 150, address: "Bornova, Izmir", addressDetail: "Ege Ünv. Kampüs Cad. 9/2", completed: false, status: "in-transit" },
];

export const initInvoices: Invoice[] = [
  { invoiceId: "INV-0041", customerId: "USR-2841", productId: 1, quantity: 2, unitPrice: 450, totalPrice: 900, date: "Mar 22, 2026", paid: true },
  { invoiceId: "INV-0042", customerId: "USR-1033", productId: 3, quantity: 3, unitPrice: 120, totalPrice: 360, date: "Mar 22, 2026", paid: true },
  { invoiceId: "INV-0043", customerId: "USR-5512", productId: 2, quantity: 1, unitPrice: 890, totalPrice: 890, date: "Mar 23, 2026", paid: false },
  { invoiceId: "INV-0044", customerId: "USR-7790", productId: 4, quantity: 1, unitPrice: 220, totalPrice: 220, date: "Mar 23, 2026", paid: false },
  { invoiceId: "INV-0045", customerId: "USR-3301", productId: 5, quantity: 2, unitPrice: 75, totalPrice: 150, date: "Mar 24, 2026", paid: true },
];
