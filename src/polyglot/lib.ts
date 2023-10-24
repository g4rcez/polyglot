export const has = <T extends {}, K extends keyof T | string>(o: T, k: K | string): k is K =>
  Object.prototype.hasOwnProperty.call(o, k);

export const noop = <T>(a: T): T => a;

type FN = (...args: any[]) => any;
export const isFn = (a: any): a is FN => typeof a === "function";
