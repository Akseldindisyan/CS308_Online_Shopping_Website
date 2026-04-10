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
