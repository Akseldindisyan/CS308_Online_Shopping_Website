export type Invoice = {
    invoiceId: string;
    customerId: string;
    productId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    date: string;
    isPaid: boolean;
};
