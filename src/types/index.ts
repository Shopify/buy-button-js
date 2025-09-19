/**
 * Core interfaces and shared types for buy-button-js
 */

import type { Client, Product, Variant, Collection, Checkout } from 'shopify-buy';

/**
 * Core component configuration
 */
export interface ComponentConfig {
  id?: string;
  storefrontId?: string | string[];
  handle?: string;
  node?: HTMLElement;
  debug?: boolean;
  moneyFormat?: string;
  cartNode?: HTMLElement;
  modalNode?: HTMLElement;
  toggles?: Toggle[];
  options?: ComponentOptions;
}

/**
 * Component options
 */
export interface ComponentOptions {
  product?: ProductComponentOptions;
  cart?: CartComponentOptions;
  modal?: ModalComponentOptions;
  productSet?: ProductSetComponentOptions;
  toggle?: ToggleComponentOptions;
  checkout?: CheckoutComponentOptions;
  [key: string]: any;
}

/**
 * Product component specific options
 */
export interface ProductComponentOptions {
  layout?: 'horizontal' | 'vertical';
  contents?: ProductContents;
  templates?: ProductTemplates;
  order?: string[];
  width?: string;
  classes?: ProductClasses;
  text?: ProductText;
  buttonDestination?: 'cart' | 'modal' | 'checkout';
  isButton?: boolean;
  showVariantTitle?: boolean;
  quantity?: boolean;
  quantityIncrement?: boolean;
  startOpen?: boolean;
  iframe?: boolean;
  DOMEvents?: DOMEvents;
  events?: ComponentEvents;
}

/**
 * Cart component specific options
 */
export interface CartComponentOptions {
  contents?: CartContents;
  templates?: CartTemplates;
  order?: string[];
  classes?: CartClasses;
  text?: CartText;
  startOpen?: boolean;
  iframe?: boolean;
  popup?: boolean;
  DOMEvents?: DOMEvents;
  events?: ComponentEvents;
}

/**
 * Modal component specific options
 */
export interface ModalComponentOptions {
  product?: ProductComponentOptions;
  contents?: ModalContents;
  classes?: ModalClasses;
  order?: string[];
  iframe?: boolean;
  DOMEvents?: DOMEvents;
  events?: ComponentEvents;
}

/**
 * ProductSet component specific options
 */
export interface ProductSetComponentOptions {
  contents?: ProductSetContents;
  templates?: ProductSetTemplates;
  classes?: ProductSetClasses;
  limit?: number;
  order?: string[];
  iframe?: boolean;
  DOMEvents?: DOMEvents;
  events?: ComponentEvents;
}

/**
 * Toggle component specific options
 */
export interface ToggleComponentOptions {
  contents?: ToggleContents;
  templates?: ToggleTemplates;
  classes?: ToggleClasses;
  sticky?: boolean;
  iframe?: boolean;
  DOMEvents?: DOMEvents;
  events?: ComponentEvents;
}

/**
 * Checkout component specific options
 */
export interface CheckoutComponentOptions {
  iframe?: boolean;
  DOMEvents?: DOMEvents;
  events?: ComponentEvents;
}

/**
 * Content visibility configurations
 */
export interface ProductContents {
  img?: boolean;
  imgWithCarousel?: boolean;
  title?: boolean;
  variantTitle?: boolean;
  price?: boolean;
  unitPrice?: boolean;
  options?: boolean;
  quantity?: boolean;
  quantityIncrement?: boolean;
  quantityDecrement?: boolean;
  quantityInput?: boolean;
  button?: boolean;
  buttonWithQuantity?: boolean;
  description?: boolean;
}

export interface CartContents {
  title?: boolean;
  lineItems?: boolean;
  footer?: boolean;
  note?: boolean;
  discounts?: boolean;
  [key: string]: boolean | undefined;
}

export interface ModalContents {
  contents?: boolean;
  [key: string]: boolean | undefined;
}

export interface ProductSetContents {
  products?: boolean;
  pagination?: boolean;
  title?: boolean;
  [key: string]: boolean | undefined;
}

export interface ToggleContents {
  count?: boolean;
  icon?: boolean;
  title?: boolean;
  [key: string]: boolean | undefined;
}

/**
 * Template configurations
 */
export interface ProductTemplates {
  title?: string;
  button?: string;
  price?: string;
  compareAt?: string;
  unitPrice?: string;
  description?: string;
  variantTitle?: string;
  [key: string]: string | undefined;
}

export interface CartTemplates {
  title?: string;
  lineItems?: string;
  footer?: string;
  [key: string]: string | undefined;
}

export interface ProductSetTemplates {
  title?: string;
  products?: string;
  [key: string]: string | undefined;
}

export interface ToggleTemplates {
  icon?: string;
  title?: string;
  [key: string]: string | undefined;
}

/**
 * CSS class configurations
 */
export interface ProductClasses {
  wrapper?: string[];
  product?: string[];
  button?: string[];
  [key: string]: string[] | undefined;
}

export interface CartClasses {
  wrapper?: string[];
  cart?: string[];
  lineItem?: string[];
  [key: string]: string[] | undefined;
}

export interface ModalClasses {
  wrapper?: string[];
  modal?: string[];
  [key: string]: string[] | undefined;
}

export interface ProductSetClasses {
  wrapper?: string[];
  products?: string[];
  product?: string[];
  [key: string]: string[] | undefined;
}

export interface ToggleClasses {
  wrapper?: string[];
  toggle?: string[];
  [key: string]: string[] | undefined;
}

/**
 * Text/Label configurations
 */
export interface ProductText {
  button?: string;
  outOfStock?: string;
  unavailable?: string;
  unitPriceAccessibilityLabel?: string;
  unitPriceSeparator?: string;
  [key: string]: string | undefined;
}

export interface CartText {
  title?: string;
  total?: string;
  notice?: string;
  shipping?: string;
  taxes?: string;
  currency?: string;
  button?: string;
  noteDescription?: string;
  [key: string]: string | undefined;
}

/**
 * DOM Events
 */
export interface DOMEvents {
  [selector: string]: {
    [eventName: string]: EventHandler | EventHandler[];
  };
}

export type EventHandler = (event: Event) => void;

/**
 * Component lifecycle events
 */
export interface ComponentEvents {
  beforeInit?: () => void;
  afterInit?: () => void;
  beforeRender?: () => void;
  afterRender?: () => void;
  beforeDestroy?: () => void;
  afterDestroy?: () => void;
  [key: string]: (() => void) | undefined;
}

/**
 * Toggle configuration
 */
export interface Toggle {
  id?: string;
  node?: HTMLElement;
  component?: string;
  [key: string]: any;
}

/**
 * UI configuration
 */
export interface UIConfig {
  domain?: string;
  storefrontAccessToken?: string;
  components?: UIComponents;
  [key: string]: any;
}

/**
 * UI components configuration
 */
export interface UIComponents {
  product?: ComponentConfig[];
  cart?: ComponentConfig[];
  collection?: ComponentConfig[];
  productSet?: ComponentConfig[];
  modal?: ComponentConfig[];
  toggle?: ComponentConfig[];
  [key: string]: ComponentConfig[] | undefined;
}

/**
 * Props passed to components
 */
export interface ComponentProps {
  client: Client;
  createCart(): void;
  closeCart(): void;
  openCart(): void;
  toggleCart(): void;
  createModal(): void;
  closeModal(): void;
  openModal(): void;
  setModalProduct(product: Product): void;
  closeCartOnCheckout?: boolean;
  browserFeatures: BrowserFeatures;
  tracker?: Tracker;
}

/**
 * Browser features detection
 */
export interface BrowserFeatures {
  transition: boolean;
  animation: boolean;
  transform: boolean;
  [key: string]: boolean;
}

/**
 * Analytics tracking
 */
export interface Tracker {
  track(eventName: string, eventProperties?: Record<string, any>): void;
  trackMethod(fn: Function, event: string, properties?: Record<string, any>): Function;
}

/**
 * Component model types
 */
export type ComponentModel = Product | Collection | Checkout | Cart;

/**
 * Cart model
 */
export interface Cart {
  id: string;
  lineItems: LineItem[];
  subtotalPrice: string;
  totalPrice: string;
  checkoutUrl: string;
  note?: string;
  discounts?: Discount[];
}

/**
 * Line item in cart
 */
export interface LineItem {
  id: string;
  title: string;
  variant: Variant;
  quantity: number;
  line_price?: string;
}

/**
 * Discount
 */
export interface Discount {
  applicable: boolean;
  amount: string;
}

/**
 * Component instance type
 */
export interface ComponentInstance {
  id?: string;
  name: string;
  typeKey: string;
  node: HTMLElement | null;
  config: ComponentOptions;
  model: ComponentModel;
  view: ViewInstance;
  updater: UpdaterInstance;
  props: ComponentProps;
  options: Record<string, any>;
  DOMEvents: DOMEvents;
  events: ComponentEvents;
  init(): Promise<void>;
  destroy(): void;
}

/**
 * View instance type
 */
export interface ViewInstance {
  component: ComponentInstance;
  iframe: HTMLIFrameElement | null;
  node: HTMLElement | null;
  template: string;
  render(): void;
  resize(): void;
  updateNode(node: HTMLElement): void;
  wrapTemplate(template: string): string;
}

/**
 * Updater instance type
 */
export interface UpdaterInstance {
  component: ComponentInstance;
  updateConfig(config: Record<string, any>): void;
  update(): void;
}

/**
 * Export all types
 */
export type { 
  Client,
  Product, 
  Variant, 
  Collection, 
  Checkout 
} from 'shopify-buy';