/**
 * Common utility types for buy-button-js
 */

/**
 * Make all properties in T optional recursively
 */
export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

/**
 * Make a type nullable (can be null or undefined)
 */
export type Nullable<T> = T | null | undefined;

/**
 * Make specific properties of T optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties of T required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Extract the return type of an async function
 */
export type AsyncReturnType<T extends (...args: any) => Promise<any>> = 
  T extends (...args: any) => Promise<infer R> ? R : never;

/**
 * Type for any function
 */
export type AnyFunction = (...args: any[]) => any;

/**
 * Type for a constructor function
 */
export type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Type for object with string keys
 */
export type Dictionary<T = any> = Record<string, T>;

/**
 * Make all properties in T readonly recursively
 */
export type DeepReadonly<T> = T extends Function
  ? T
  : T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;

/**
 * Pick properties from T that are assignable to U
 */
export type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P]
};

/**
 * Omit properties from T that are assignable to U
 */
export type OmitByType<T, U> = {
  [P in keyof T as T[P] extends U ? never : P]: T[P]
};

/**
 * Type for a value that can be a promise or not
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * Type for a value that can be an array or not
 */
export type MaybeArray<T> = T | T[];

/**
 * Get the union of all values in an object type
 */
export type ValueOf<T> = T[keyof T];

/**
 * Make specific properties of T nullable
 */
export type NullableBy<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: T[P] | null | undefined;
};

/**
 * Type guard helper
 */
export type TypeGuard<T> = (value: unknown) => value is T;

/**
 * Extract properties from T that are functions
 */
export type FunctionProperties<T> = PickByType<T, AnyFunction>;

/**
 * Extract properties from T that are not functions
 */
export type NonFunctionProperties<T> = OmitByType<T, AnyFunction>;

/**
 * Merge two types, with properties from B overriding those in A
 */
export type Merge<A, B> = Omit<A, keyof B> & B;

/**
 * Type for an object that can have additional string-keyed properties
 */
export type Extensible<T> = T & Dictionary;

/**
 * Ensure a type is not null or undefined
 */
export type NonNullable<T> = T extends null | undefined ? never : T;