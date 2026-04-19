export type ProductDetailed = {
    id: number;
    name: string;
    model: string;
    serialNumber: string;
    category: string;
    price: number;
    rating: number;
    image: string   ;
    extraImages?: string[];
    description:string;    
    features?: string[];
    stock: number;
    warrantyStatus: "valid" | "expired";
    distributorName: string;    
    distributorContact?: string;
    distributorAddress?: string;
    distributorEmail?: string;
};
