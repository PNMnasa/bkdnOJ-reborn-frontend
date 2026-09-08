declare module "history" {
  export interface Location<S = unknown> {
    pathname: string;
    search: string;
    hash: string;
    state: S;
    key: string;
  }

  export type Action = "PUSH" | "POP" | "REPLACE";

  export type Path = string | Partial<Location>;

  export interface Pathname {
    pathname: string;
    search?: string;
    hash?: string;
  }

  export interface LocationDescriptorObject {
    pathname?: string;
    search?: string;
    hash?: string;
    state?: unknown;
  }

  export type LocationDescriptor = string | LocationDescriptorObject;

  export interface History<LocationState = unknown> {
    length: number;
    action: Action;
    location: Location<LocationState>;
    push(path: Path, state?: LocationState): void;
    push(location: LocationDescriptorObject): void;
    replace(path: Path, state?: LocationState): void;
    replace(location: LocationDescriptorObject): void;
    go(n: number): void;
    goBack(): void;
    goForward(): void;
    listen(listener: (location: Location<LocationState>, action: Action) => void): () => void;
    createHref(location: Path): string;
  }

  export function createBrowserHistory<S = unknown>(options?: { window?: Window }): History<S>;
  export function createHashHistory<S = unknown>(options?: { window?: Window }): History<S>;
  export function createMemoryHistory<S = unknown>(options?: { initialEntries?: string[]; initialIndex?: number }): History<S>;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

declare module "*.css" {
  const content: string;
  export default content;
}

declare module "*.pdf" {
  const src: string;
  export default src;
}