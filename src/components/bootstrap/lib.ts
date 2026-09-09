import * as React from "react";

export function cx(...args: Array<string | false | null | undefined>): string | undefined {
  return args.filter(Boolean).join(" ") || undefined;
}

export const breakpoints = ["xs", "sm", "md", "lg", "xl", "xxl"] as const;
export const minBreakpoint = "xs";

export function makeEventKey(eventKey: unknown, href?: unknown): unknown {
  if (eventKey != null) return eventKey;
  return href == null ? "" : href;
}

export interface DropdownContextValue {
  show: boolean;
  setShow: (show: boolean) => void;
  onSelect?: (key: unknown, e: React.SyntheticEvent) => void;
}

export const FormCtx = React.createContext<{ controlId?: string }>({});

export const NavbarCtx = React.createContext<{
  onToggle: () => void;
  bsPrefix: string;
  expanded: boolean;
  expand: string | boolean;
} | null>(null);

export const NavCtx = React.createContext<{
  activeKey?: unknown;
  onSelect?: (key: unknown, e: React.SyntheticEvent) => void;
} | null>(null);

export const SelectableCtx = React.createContext<
  ((key: unknown, e: React.SyntheticEvent) => void) | null
>(null);

export const AccordionCtx = React.createContext<{
  activeEventKey?: unknown;
  onSelect?: (key: unknown, e: React.SyntheticEvent) => void;
  alwaysOpen?: boolean;
}>({});

export const AccordionItemCtx = React.createContext<{ eventKey?: unknown }>({});

export const DropdownCtx = React.createContext<DropdownContextValue | null>(null);

export interface HandlerProps {
  onClick?: React.MouseEventHandler<any>;
  onKeyDown?: React.KeyboardEventHandler<any>;
  onKeyUp?: React.KeyboardEventHandler<any>;
  onChange?: React.ChangeEventHandler<any>;
  onSubmit?: React.FormEventHandler<any>;
  onFocus?: React.FocusEventHandler<any>;
  onBlur?: React.FocusEventHandler<any>;
  onMouseOver?: React.MouseEventHandler<any>;
  onMouseOut?: React.MouseEventHandler<any>;
  onMouseEnter?: React.MouseEventHandler<any>;
  onMouseLeave?: React.MouseEventHandler<any>;
  [key: string]: any;
}

export interface SelectableProps extends HandlerProps {
  onSelect?: (key: unknown, e: React.SyntheticEvent) => void;
}

export interface TogglerProps extends HandlerProps {
  onToggle?: (show: boolean) => void;
}

export interface HideableProps extends HandlerProps {
  onHide?: () => void;
}