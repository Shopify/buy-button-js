export default function isFunction(obj: any): boolean {
  return !!(obj && obj.constructor && obj.call && obj.apply);
}