import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Product {
    id: bigint;
    name: string;
    tags: Array<string>;
    description: string;
    imageUrl: string;
    category: string;
}
export interface PriceEntry {
    inStock: boolean;
    productId: bigint;
    store: string;
    price: number;
}
export interface backendInterface {
    addPriceEntry(productId: bigint, store: string, price: number, inStock: boolean): Promise<PriceEntry>;
    createProduct(name: string, category: string, description: string, imageUrl: string, tags: Array<string>): Promise<Product>;
    deletePriceEntry(productId: bigint, store: string): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    getAIInsight(productId: bigint): Promise<string>;
    getAllProducts(): Promise<Array<Product>>;
    getPriceEntries(productId: bigint): Promise<Array<PriceEntry>>;
    getProduct(id: bigint): Promise<Product>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    searchProducts(searchText: string): Promise<Array<Product>>;
    updatePriceEntry(productId: bigint, store: string, price: number, inStock: boolean): Promise<PriceEntry>;
    updateProduct(id: bigint, name: string, category: string, description: string, imageUrl: string, tags: Array<string>): Promise<Product>;
}
