export type Comment = {
    id: number;
    productId: number;
    author: string;
    text: string;
    rating: number;
    status: "pending" | "approved" | "rejected";
    date: string;
};
