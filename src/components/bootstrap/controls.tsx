import * as React from "react";
import { cx, HandlerProps } from "./lib";

export function Button({
  as,
  bsPrefix = "btn",
  variant,
  size,
  active,
  className,
  disabled,
  onClick,
  href,
  ...rest
}: HandlerProps) {
  const isTrivialHref = !href || href.trim() === "#";
  let tagName: any = as;
  if (!tagName) {
    tagName = href != null ? "a" : "button";
  }
  let extra: any = {};
  if (tagName === "button") {
    extra = { type: rest.type || "button", disabled };
  } else {
    const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
      if (disabled || (tagName === "a" && isTrivialHref)) e.preventDefault();
      if (disabled) {
        e.stopPropagation();
        return;
      }
      onClick?.(e as React.MouseEvent);
    };
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        handleClick(e);
      }
    };
    extra = {
      role: rest.role != null ? rest.role : "button",
      disabled: undefined,
      tabIndex: disabled ? undefined : 0,
      href: tagName === "a" ? href || "#" : undefined,
      "aria-disabled": disabled || undefined,
      target: tagName === "a" ? rest.target : undefined,
      rel: tagName === "a" ? rest.rel : undefined,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
    };
  }
  const classes = cx(
    className,
    bsPrefix,
    variant && `${bsPrefix}-${variant}`,
    size && `${bsPrefix}-${size}`,
    active && "active",
  );
  const Component = tagName;
  return <Component {...extra} {...rest} className={classes} />;
}

export function Badge({
  as: Component = "span",
  bsPrefix = "badge",
  variant = "primary",
  pill,
  className,
  ...rest
}: HandlerProps) {
  return (
    <Component
      {...rest}
      className={cx(
        className,
        bsPrefix,
        variant && `${bsPrefix}-${variant}`,
        pill && `${bsPrefix}-pill`,
      )}
    />
  );
}

export function Image({
  bsPrefix = "img",
  fluid,
  rounded,
  roundedCircle,
  thumbnail,
  className,
  ...rest
}: HandlerProps) {
  return (
    <img
      {...rest}
      className={cx(
        fluid && `${bsPrefix}-fluid`,
        rounded && "rounded",
        roundedCircle && `${bsPrefix}-rounded-circle`,
        thumbnail && `${bsPrefix}-thumbnail`,
        className,
      )}
    />
  );
}

export function Table({
  bsPrefix = "table",
  className,
  striped,
  bordered,
  borderless,
  hover,
  size,
  variant,
  responsive,
  ...rest
}: HandlerProps) {
  const classes = cx(
    className,
    bsPrefix,
    variant && `${bsPrefix}-${variant}`,
    size && `${bsPrefix}-${size}`,
    striped &&
      `${bsPrefix}-${typeof striped === "string" ? `striped-${striped}` : "striped"}`,
    bordered && `${bsPrefix}-bordered`,
    borderless && `${bsPrefix}-borderless`,
    hover && `${bsPrefix}-hover`,
  );
  const table = <table {...rest} className={classes} />;
  if (responsive) {
    let responsiveClass = `${bsPrefix}-responsive`;
    if (typeof responsive === "string") {
      responsiveClass = `${responsiveClass}-${responsive}`;
    }
    return <div className={responsiveClass}>{table}</div>;
  }
  return table;
}