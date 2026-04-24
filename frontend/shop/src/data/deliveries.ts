import type { Delivery } from "./types";

export const deliveries: Delivery[] = [
  { deliveryId: "DLV-001", customerId: "USR-2841", productId: 4, quantity: 2, totalPrice: 598, address: "Kadıköy, Istanbul", addressDetail: "Moda Cad. No:14 D:3", completed: true, status: "delivered" },
  { deliveryId: "DLV-002", customerId: "USR-1033", productId: 3, quantity: 1, totalPrice: 549, address: "Çankaya, Ankara", addressDetail: "Tunalı Hilmi Cad. 47/5", completed: false, status: "in-transit" },
  { deliveryId: "DLV-003", customerId: "USR-5512", productId: 5, quantity: 1, totalPrice: 149, address: "Konak, Izmir", addressDetail: "Alsancak Mah. 1380 Sk.", completed: false, status: "processing" },
  { deliveryId: "DLV-004", customerId: "USR-7790", productId: 6, quantity: 1, totalPrice: 99, address: "Nilüfer, Bursa", addressDetail: "Özlüce Mah. Güzelyurt Sk.", completed: false, status: "processing" },
  { deliveryId: "DLV-005", customerId: "USR-3301", productId: 8, quantity: 2, totalPrice: 158, address: "Bornova, Izmir", addressDetail: "Ege Ünv. Kampüs Cad. 9/2", completed: false, status: "in-transit" },
];
