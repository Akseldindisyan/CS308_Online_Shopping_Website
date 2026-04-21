import type { Comment } from "./types";

export const comments: Comment[] = [
  { id: 1, productId: 4, author: "Alice M.", text: "Sound quality is excellent, packaging was great too.", rating: 5, status: "pending", date: "Mar 23, 2026" },
  { id: 2, productId: 5, author: "Bob T.", text: "Key feel is fantastic but it can be noisy.", rating: 4, status: "pending", date: "Mar 23, 2026" },
  { id: 3, productId: 6, author: "Carol W.", text: "Quality was lower than expected, I returned it.", rating: 2, status: "pending", date: "Mar 22, 2026" },
  { id: 4, productId: 3, author: "David K.", text: "Great tablet, very responsive.", rating: 5, status: "approved", date: "Mar 21, 2026" },
  { id: 5, productId: 8, author: "Emma L.", text: "Charges all my devices perfectly.", rating: 5, status: "approved", date: "Mar 20, 2026" },
  { id: 6, productId: 4, author: "Frank O.", text: "Battery life could be better but overall good.", rating: 3, status: "rejected", date: "Mar 19, 2026" },
];
