import * as React from "react";
import { createPopper } from "@popperjs/core";
import { cx, HandlerProps } from "./lib";

export function Tooltip({
  bsPrefix = "tooltip",
  placement = "right",
  className,
  show,
  style,
  arrowProps,
  children,
  ...rest
}: HandlerProps) {
  const direction = (placement?.split("-")[0]) || "right";
  return (
    <div
      {...rest}
      style={style}
      role="tooltip"
      className={cx(className, bsPrefix, `bs-tooltip-${direction}`, show && "fade show")}
    >
      <div className="tooltip-arrow" {...arrowProps} />
      <div className="tooltip-inner">{children}</div>
    </div>
  );
}

export function OverlayTrigger({
  trigger = ["hover", "focus"],
  overlay,
  children,
  popperConfig = {},
  show: propShow,
  defaultShow = false,
  onToggle,
  delay,
  placement,
  flip,
}: HandlerProps) {
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const overlayRef = React.useRef<HTMLElement | null>(null);
  const [stateShow, setStateShow] = React.useState(defaultShow);
  const show = propShow !== undefined ? propShow : stateShow;
  const setShow = (v: boolean) => {
    if (propShow === undefined) setStateShow(v);
    onToggle?.(v);
  };
  const attachRef = (node: any) => {
    triggerRef.current = node;
  };
  const child = React.Children.only(children) as React.ReactElement<any>;
  const triggers: string[] = trigger == null ? [] : [].concat(trigger);
  const triggerProps: any = { ref: attachRef };
  if (triggers.indexOf("click") !== -1) {
    triggerProps.onClick = () => setShow(!show);
  }
  if (triggers.indexOf("focus") !== -1) {
    triggerProps.onFocus = () => setShow(true);
    triggerProps.onBlur = () => setShow(false);
  }
  if (triggers.indexOf("hover") !== -1) {
    triggerProps.onMouseOver = () => setShow(true);
    triggerProps.onMouseOut = () => setShow(false);
  }
  const childWithProps = React.cloneElement(child, triggerProps);

  const popperPlacement = placement ?? overlay?.props?.placement ?? "top";

  React.useEffect(() => {
    if (!show || !triggerRef.current || !overlayRef.current) return;
    const modifiers: any[] = [{ name: "offset", options: { offset: [0, 6] } }];
    if (flip === false) modifiers.push({ name: "flip", enabled: false });
    const popper = createPopper(triggerRef.current, overlayRef.current, {
      placement: popperPlacement,
      modifiers,
      ...popperConfig,
    });
    return () => popper.destroy();
  }, [show, popperPlacement, flip, popperConfig]);

  const overlayEl = React.isValidElement(overlay)
    ? React.cloneElement(overlay as React.ReactElement<any>, {
        ref: (node: any) => {
          overlayRef.current = node;
        },
        show: true,
        placement: popperPlacement,
      } as any)
    : overlay;

  return (
    <>
      {childWithProps}
      {show && overlayEl}
    </>
  );
}