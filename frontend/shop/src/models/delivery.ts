export type Delivery = {
    deliveryId: string;
    customerId: string;
    productId: number;
    quantity: number;
    totalPrice: number;
    address: string;
    addressDetail: string;
    completed: boolean;
    status: "PENDING" | "IN_TRANSIT" | "COMPLETED";
};
