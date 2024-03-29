import { Path, To } from "history";

export const last = <T>(a: T[]) => {
  if (!a) return undefined;
  return a[a.length - 1];
};

export const combineUrlSegments = (...urls: (string | undefined)[]) => {
  // remove all multiple slashes, remove * or / from the end
  const path = urls.join("/").replace(/\/+/g, "/");
  if (path === "") return "/";
  if (path !== "/") {
    return path.replace(/(\*|\/)$/, "");
  }
  return path;
};

export const prependSlash = (url: string) => {
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  if (url.startsWith("/")) return url;
  return `/${url}`;
};
export const surroundSlash = (url: string) => {
  if (url.startsWith("/") && url.endsWith("/")) return url;
  if (url.startsWith("/")) return `${url}/`;
  if (url.endsWith("/")) return `/${url}`;
  return `/${url}/`;
};

export const uniqueBy = <T>(array: T[], key: (t: T) => string) => {
  const result: T[] = [];
  const map = new Map();
  // eslint-disable-next-line no-restricted-syntax
  for (const item of array) {
    if (!map.has(key(item))) {
      map.set(key(item), true); // set any value to Map
      result.push(item);
    }
  }
  return result;
};

export const uniqueByIfConsequtive = <T>(array: T[], key: (t: T) => string) => {
  const result: T[] = [];
  let lastItemKey: string | undefined;
  // eslint-disable-next-line no-restricted-syntax
  for (const item of array) {
    if (lastItemKey !== key(item)) {
      lastItemKey = key(item); // set any value to Map
      result.push(item);
    }
  }
  return result;
};

export const getToAsPieces = (to: To): Partial<Path> => {
  if (typeof to !== "string") {
    return to;
  }
  const url = new URL(to);
  return url;
};

export const getToPiecesAsString = (to: To): string => {
  if (typeof to === "string") {
    return to;
  }
  return `${to.pathname}${to.search}${to.hash}`;
};
