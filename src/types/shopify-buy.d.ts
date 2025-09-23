/**
 * Custom type definitions for shopify-buy SDK
 * Based on actual usage in buy-button-js codebase
 * Note: These are custom types, not from @types/shopify-buy
 */

declare module 'shopify-buy' {
  export interface Config {
    domain: string;
    storefrontAccessToken: string;
    source?: string;
  }

  export interface Image {
    id: string;
    src: string;
    altText?: string;
  }

  export interface ProductOption {
    name: string;
    values: string[];
  }

  export interface SelectedOption {
    name: string;
    value: string;
  }

  export interface Variant {
    id: string;
    title: string;
    price: string;
    available: boolean;
    image?: Image;
    selectedOptions: SelectedOption[];
    sku?: string;
  }

  export interface Product {
    id: string;
    title: string;
    handle: string;
    description: string;
    descriptionHtml: string;
    images: Image[];
    variants: Variant[];
    options: ProductOption[];
    availableForSale: boolean;
  }

  export interface Collection {
    id: string;
    handle: string;
    title: string;
    description: string;
    products: Product[];
  }

  export interface LineItem {
    id: string;
    variant: Variant;
    quantity: number;
    title: string;
  }

  export interface CheckoutLineItem {
    variantId: string;
    quantity: number;
  }

  /**
   * Input for creating a checkout
   * 
   * IMPORTANT: Type safety decision documented
   * 
   * The Shopify Buy SDK technically allows creating checkouts without line items,
   * but buy-button-js ALWAYS provides lineItems when calling checkout.create().
   * 
   * Evidence from codebase analysis:
   * - Every checkout.create() call includes lineItems array with at least one item
   * - No use case in buy-button-js for empty checkouts
   * - Making this required catches configuration errors at compile time
   * 
   * If SDK behavior changes or empty checkouts become needed, this can be made
   * optional again, but for now strict typing better reflects actual usage.
   */
  export interface CheckoutCreateInput {
    lineItems: CheckoutLineItem[];  // Required in our app (though SDK allows empty checkouts)
    presentmentCurrencyCode?: string;
  }

  export interface Checkout {
    id: string;
    webUrl: string;
    lineItems: LineItem[];
    subtotalPrice: string;
    totalPrice: string;
    totalTax: string;
    currencyCode: string;
    note?: string;
    completedAt?: string;
  }

  export interface ImageHelpers {
    imageForSize(image: Image, options: { maxWidth?: number; maxHeight?: number }): string;
  }

  export interface ProductHelpers {
    variantForOptions(product: Product, selectedOptions: SelectedOption[]): Variant | null;
  }

  export interface ProductResource {
    fetch(id: string): Promise<Product>;
    fetchMultiple(ids: string[]): Promise<Product[]>;
    fetchByHandle(handle: string): Promise<Product>;
    fetchQuery(query: object): Promise<Product[]>;
    helpers: ProductHelpers;
  }

  export interface CollectionResource {
    fetchWithProducts(id: string): Promise<Collection>;
    fetchByHandle(handle: string): Promise<Collection>;
  }

  export interface CheckoutResource {
    create(input?: CheckoutCreateInput): Promise<Checkout>;
    fetch(id: string): Promise<Checkout>;
    addLineItems(checkoutId: string, lineItems: CheckoutLineItem[]): Promise<Checkout>;
    updateLineItems(checkoutId: string, lineItems: CheckoutLineItem[]): Promise<Checkout>;
    removeLineItems(checkoutId: string, lineItemIds: string[]): Promise<Checkout>;
    /**
     * Update checkout attributes
     * 
     * IMPORTANT: Type restriction rationale
     * 
     * The Shopify Buy SDK allows updating various checkout attributes, but
     * buy-button-js ONLY ever updates the 'note' field.
     * 
     * Evidence from codebase:
     * - Only usage is in src/components/cart.js:353 with {note: evt.target.value}
     * - No other attributes are ever passed to this method
     * - Restricting to { note: string } prevents misuse and provides better type safety
     * 
     * If other attributes need to be updated in the future, expand this interface
     * to include them explicitly rather than using a generic Record<string, any>.
     */
    updateAttributes(checkoutId: string, attributes: { note: string }): Promise<Checkout>;  // Only note is used in our app
  }

  export interface Client {
    config: Config;
    product: ProductResource;
    collection: CollectionResource;
    checkout: CheckoutResource;
    image: {
      helpers: ImageHelpers;
    };
  }

  export default class ShopifyBuy {
    static buildClient(config: Config): Client;
  }
}