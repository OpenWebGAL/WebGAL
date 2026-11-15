declare module 'stylis' {
  export interface StylisElement {
    type: string;
    value: string;
    props: string[] | string;
    children: StylisElement[] | string;
    root: StylisElement | null;
    parent: StylisElement | null;
    line: number;
    column: number;
    length: number;
    return: string;
  }

  export const RULESET: string;
  export const DECLARATION: string;
  export const COMMENT: string;

  export type Middleware = (
    element: StylisElement,
    index: number,
    children: StylisElement[],
    callback: Middleware,
  ) => string | void;

  export function compile(value: string): StylisElement[];
  export function serialize(children: StylisElement[], callback: Middleware): string;
  export function stringify(
    element: StylisElement,
    index: number,
    children: StylisElement[],
    callback: Middleware,
  ): string;
  export function middleware(collection: Middleware[]): Middleware;
  export function prefixer(
    element: StylisElement,
    index: number,
    children: StylisElement[],
    callback: Middleware,
  ): string | void;
}
