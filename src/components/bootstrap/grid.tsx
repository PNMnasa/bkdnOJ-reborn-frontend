import * as React from "react";
import { breakpoints, cx, HandlerProps, minBreakpoint } from "./lib";

export function Col({
  bsPrefix = "col",
  as: Component = "div",
  className,
  ...rest
}: HandlerProps) {
  const prefix = bsPrefix;
  const spans: string[] = [];
  const classes: string[] = [];
  for (const brkPoint of breakpoints) {
    const propValue = rest[brkPoint];
    delete rest[brkPoint];
    if (!propValue) continue;
    const infix = brkPoint !== minBreakpoint ? `-${brkPoint}` : "";
    if (typeof propValue === "object") {
      if (propValue.span) {
        spans.push(
          propValue.span === true
            ? `${prefix}${infix}`
            : `${prefix}${infix}-${propValue.span}`,
        );
      }
      if (typeof propValue.order === "number") {
        classes.push(`order${infix}-${propValue.order}`);
      }
      if (propValue.offset != null) {
        classes.push(`offset${infix}-${propValue.offset}`);
      }
    } else {
      spans.push(
        propValue === true ? `${prefix}${infix}` : `${prefix}${infix}-${propValue}`,
      );
    }
  }
  if (!spans.length) classes.push(prefix);
  return <Component {...rest} className={cx(className, ...spans, ...classes)} />;
}

export function Row({
  as: Component = "div",
  className,
  ...rest
}: HandlerProps) {
  const classes: string[] = [];
  for (const brkPoint of breakpoints) {
    const propValue = rest[brkPoint];
    delete rest[brkPoint];
    if (!propValue) continue;
    const infix = brkPoint !== minBreakpoint ? `-${brkPoint}` : "";
    if (typeof propValue === "object") {
      classes.push(
        propValue.cols === true
          ? `row-cols${infix}`
          : `row-cols${infix}-${propValue.cols}`,
      );
    } else {
      classes.push(
        propValue === true ? `row-cols${infix}` : `row-cols${infix}-${propValue}`,
      );
    }
  }
  return <Component {...rest} className={cx(className, "row", ...classes)} />;
}

export function Container({
  bsPrefix = "container",
  as: Component = "div",
  fluid,
  className,
  ...rest
}: HandlerProps) {
  return (
    <Component
      {...rest}
      className={cx(
        className,
        fluid
          ? fluid === true
            ? `${bsPrefix}-fluid`
            : `${bsPrefix}-fluid-${fluid}`
          : bsPrefix,
      )}
    />
  );
}