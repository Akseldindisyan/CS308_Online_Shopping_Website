export type ProductCard = {
    id: number;
    name: string;
    categoryId: number;
    price: number;
    stock: number;
    active: boolean;
    imageUrl?: string;
};
