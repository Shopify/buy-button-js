/**
 * Core interfaces and shared types for buy-button-js
 */

import type { Client, Product, Variant, Collection, Checkout } from 'shopify-buy';

/**
 * Valid manifest component names
 */
export type ManifestComponent = 'product' | 'cart' | 'modal' | 'productSet' | 'toggle' | 'option' | 'lineItem';

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
  option?: OptionComponentOptions;  // Sub-component for product options
  lineItem?: LineItemComponentOptions;  // Sub-component for cart line items
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
  manifest?: ManifestComponent[];  // Components to include
  styles?: Record<string, any>;  // CSS styles
  googleFonts?: string[];  // Google fonts to load
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
  manifest?: ManifestComponent[];  // Components to include
  styles?: Record<string, any>;  // CSS styles
  googleFonts?: string[];  // Google fonts to load
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
  manifest?: ManifestComponent[];  // Components to include
  styles?: Record<string, any>;  // CSS styles
  googleFonts?: string[];  // Google fonts to load
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
  manifest?: ManifestComponent[];  // Components to include
  styles?: Record<string, any>;  // CSS styles
  googleFonts?: string[];  // Google fonts to load
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
  manifest?: ManifestComponent[];  // Components to include
  styles?: Record<string, any>;  // CSS styles
  googleFonts?: string[];  // Google fonts to load
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
 * Option sub-component options
 */
export interface OptionComponentOptions {
  templates?: OptionTemplates;
  contents?: OptionContents;
  order?: string[];
  classes?: OptionClasses;
  styles?: Record<string, any>;  // CSS styles
  googleFonts?: string[];  // Google fonts to load
}

/**
 * LineItem sub-component options
 */
export interface LineItemComponentOptions {
  templates?: LineItemTemplates;
  contents?: LineItemContents;
  order?: string[];
  classes?: LineItemClasses;
  styles?: Record<string, any>;  // CSS styles
  googleFonts?: string[];  // Google fonts to load
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
}

export interface ModalContents {
  contents?: boolean;
}

export interface ProductSetContents {
  products?: boolean;
  pagination?: boolean;
  title?: boolean;
}

export interface ToggleContents {
  count?: boolean;
  icon?: boolean;
  title?: boolean;
}

export interface OptionContents {
  option?: boolean;
}

export interface LineItemContents {
  image?: boolean;
  variantTitle?: boolean;
  title?: boolean;
  price?: boolean;
  priceWithDiscounts?: boolean;
  quantity?: boolean;
  quantityIncrement?: boolean;
  quantityDecrement?: boolean;
  quantityInput?: boolean;
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
}

export interface CartTemplates {
  title?: string;
  lineItems?: string;
  footer?: string;
}

export interface ProductSetTemplates {
  title?: string;
  products?: string;
}

export interface ToggleTemplates {
  icon?: string;
  title?: string;
}

export interface OptionTemplates {
  option?: string;
}

export interface LineItemTemplates {
  image?: string;
  title?: string;
  variantTitle?: string;
  price?: string;
  priceWithDiscounts?: string;
  quantity?: string;
}

/**
 * CSS class configurations
 */
export interface ProductClasses {
  wrapper?: string[];
  product?: string[];
  button?: string[];
  img?: string[];
  imgWrapper?: string[];
  carousel?: string[];
  title?: string[];
  price?: string[];
  options?: string[];
  quantity?: string[];
  description?: string[];
  hasImage?: string[];
}

export interface CartClasses {
  wrapper?: string[];
  cart?: string[];
  lineItem?: string[];
  footer?: string[];
  title?: string[];
  note?: string[];
  button?: string[];
  subtotal?: string[];
}

export interface ModalClasses {
  wrapper?: string[];
  modal?: string[];
  overlay?: string[];
  contents?: string[];
  close?: string[];
  footer?: string[];
  product?: string[];
  img?: string[];
  imgWithCarousel?: string[];
}

export interface ProductSetClasses {
  wrapper?: string[];
  products?: string[];
  product?: string[];
  title?: string[];
  pagination?: string[];
}

export interface ToggleClasses {
  wrapper?: string[];
  toggle?: string[];
  icon?: string[];
  count?: string[];
}

export interface OptionClasses {
  option?: string[];
  wrapper?: string[];
  select?: string[];
  label?: string[];
  optionDisabled?: string[];
  optionSelected?: string[];
  selectIcon?: string[];
  hiddenLabel?: string[];
}

export interface LineItemClasses {
  image?: string[];
  title?: string[];
  variantTitle?: string[];
  price?: string[];
  priceWithDiscounts?: string[];
  quantity?: string[];
  quantityButton?: string[];
  quantityInput?: string[];
  remove?: string[];
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
  discountText?: string;
  subtotal?: string;
  empty?: string;
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
}

/**
 * Toggle configuration
 */
export interface Toggle {
  id?: string;
  node?: HTMLElement;
  component?: string;
}

/**
 * UI configuration
 */
export interface UIConfig {
  domain?: string;
  storefrontAccessToken?: string;
  components?: UIComponents;
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