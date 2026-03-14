import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
    email: string;
    address?: ShippingAddress;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShippingAddress {
    zip: string;
    street: string;
    country: string;
    city: string;
    name: string;
    state: string;
}
export interface OrderItem {
    color: string;
    size: string;
    productId: string;
    quantity: bigint;
    price: bigint;
}
export interface Order {
    id: string;
    status: OrderStatus;
    createdAt: bigint;
    updatedAt: bigint;
    totalAmount: bigint;
    shippingAddress: ShippingAddress;
    customerId: Principal;
    items: Array<OrderItem>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface IntegrationConfig {
    apiEndpoint: string;
    apiKey: string;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface CartItem {
    color: string;
    size: string;
    productId: string;
    quantity: bigint;
}
export interface Product {
    id: string;
    title: string;
    createdAt: bigint;
    description: string;
    isActive: boolean;
    sizes: Array<string>;
    imageUrl: string;
    category: string;
    colors: Array<string>;
    basePrice: bigint;
}
export enum OrderStatus {
    shipped = "shipped",
    cancelled = "cancelled",
    pending = "pending",
    delivered = "delivered",
    processing = "processing"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addToCart(item: CartItem): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCart(): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createProduct(product: Product): Promise<void>;
    deleteProduct(id: string): Promise<void>;
    getActiveProducts(): Promise<Array<Product>>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<CartItem>>;
    getIntegrationConfig(): Promise<IntegrationConfig>;
    getMyOrders(): Promise<Array<Order>>;
    getProductById(id: string): Promise<Product>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    placeOrder(order: Order): Promise<void>;
    removeFromCart(productId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setIntegrationConfig(config: IntegrationConfig): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    testIntegration(): Promise<string>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateCartItem(item: CartItem): Promise<void>;
    updateOrderStatus(id: string, status: OrderStatus): Promise<void>;
    updateProduct(product: Product): Promise<void>;
}
