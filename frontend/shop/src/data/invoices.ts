import type { Invoice } from "./types";

export const invoices: Invoice[] = [
  { invoiceId: "INV-0041", customerId: "USR-2841", productId: 4, quantity: 2, unitPrice: 299, totalPrice: 598, date: "2026-03-01", paid: true },
  { invoiceId: "INV-0042", customerId: "USR-1033", productId: 3, quantity: 1, unitPrice: 549, totalPrice: 549, date: "2026-03-03", paid: true },
  { invoiceId: "INV-0043", customerId: "USR-5512", productId: 5, quantity: 1, unitPrice: 149, totalPrice: 149, date: "2026-03-05", paid: false },
  { invoiceId: "INV-0044", customerId: "USR-7790", productId: 6, quantity: 1, unitPrice: 99, totalPrice: 99, date: "2026-03-08", paid: false },
  { invoiceId: "INV-0045", customerId: "USR-3301", productId: 8, quantity: 2, unitPrice: 79, totalPrice: 158, date: "2026-03-10", paid: true },
  { invoiceId: "INV-0046", customerId: "USR-4102", productId: 1, quantity: 1, unitPrice: 1299, totalPrice: 1299, date: "2026-03-12", paid: true },
  { invoiceId: "INV-0047", customerId: "USR-6621", productId: 2, quantity: 2, unitPrice: 899, totalPrice: 1798, date: "2026-03-14", paid: true },
  { invoiceId: "INV-0048", customerId: "USR-1180", productId: 4, quantity: 1, unitPrice: 299, totalPrice: 299, date: "2026-03-16", paid: true },
  { invoiceId: "INV-0049", customerId: "USR-2841", productId: 3, quantity: 2, unitPrice: 549, totalPrice: 1098, date: "2026-03-18", paid: false },
  { invoiceId: "INV-0050", customerId: "USR-7790", productId: 5, quantity: 3, unitPrice: 149, totalPrice: 447, date: "2026-03-20", paid: true },
  { invoiceId: "INV-0051", customerId: "USR-3301", productId: 2, quantity: 1, unitPrice: 899, totalPrice: 899, date: "2026-03-22", paid: true },
  { invoiceId: "INV-0052", customerId: "USR-5512", productId: 7, quantity: 1, unitPrice: 479, totalPrice: 479, date: "2026-03-24", paid: true },
];
