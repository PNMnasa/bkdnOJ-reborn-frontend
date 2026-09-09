import * as React from "react";
import { cx, HandlerProps } from "./lib";

export function Collapse({ in: show = false, className, children }: HandlerProps) {
  const child = React.Children.only(children);
  return React.cloneElement(child, {
    className: cx(
      className,
      (child.props as any).className,
      show ? "collapse show" : "collapse",
    ),
  });
}