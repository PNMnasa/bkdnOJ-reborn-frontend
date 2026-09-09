import * as React from "react";
import { AccordionCtx, AccordionItemCtx, cx, HandlerProps, SelectableProps } from "./lib";
import { Collapse } from "./collapse";

function isItemSelected(activeEventKey: unknown, eventKey: unknown): boolean {
  return Array.isArray(activeEventKey)
    ? activeEventKey.includes(eventKey)
    : activeEventKey === eventKey;
}

export function Accordion({
  as: Component = "div",
  activeKey: propKey,
  defaultActiveKey,
  onSelect,
  className,
  flush,
  alwaysOpen,
  children,
  ...rest
}: SelectableProps) {
  const [stateKey, setStateKey] = React.useState<unknown>(defaultActiveKey);
  const activeEventKey = propKey !== undefined ? propKey : stateKey;
  const handleSelect = (key: unknown, e: React.SyntheticEvent) => {
    if (propKey === undefined) setStateKey(key);
    onSelect?.(key, e);
  };
  return (
    <AccordionCtx.Provider value={{ activeEventKey, onSelect: handleSelect, alwaysOpen }}>
      <Component {...rest} className={cx(className, "accordion", flush && "accordion-flush")}>
        {children}
      </Component>
    </AccordionCtx.Provider>
  );
}

export function AccordionItem({
  as: Component = "div",
  className,
  eventKey,
  children,
  ...rest
}: HandlerProps) {
  return (
    <AccordionItemCtx.Provider value={{ eventKey }}>
      <Component {...rest} className={cx(className, "accordion-item")}>
        {children}
      </Component>
    </AccordionItemCtx.Provider>
  );
}

export function AccordionButton({
  as: Component = "button",
  className,
  onClick,
  children,
  ...rest
}: HandlerProps) {
  const { eventKey } = React.useContext(AccordionItemCtx);
  const { activeEventKey, onSelect } = React.useContext(AccordionCtx);
  const selected = isItemSelected(activeEventKey, eventKey);
  const handleClick = (e: React.MouseEvent) => {
    const next = eventKey === activeEventKey ? null : eventKey;
    onSelect?.(next, e);
    onClick?.(e);
  };
  const props = Component === "button" ? { type: "button" } : {};
  return (
    <Component
      {...rest}
      {...props}
      onClick={handleClick}
      aria-expanded={selected}
      className={cx(className, "accordion-button", !selected && "collapsed")}
    >
      {children}
    </Component>
  );
}

export function AccordionHeader({
  as: Component = "h2",
  className,
  children,
  "aria-controls": ariaControls,
  onClick,
  ...rest
}: HandlerProps) {
  return (
    <Component {...rest} className={cx(className, "accordion-header")}>
      <AccordionButton onClick={onClick} aria-controls={ariaControls}>
        {children}
      </AccordionButton>
    </Component>
  );
}

export function AccordionCollapse({ className, children, eventKey, ...rest }: HandlerProps) {
  const { activeEventKey } = React.useContext(AccordionCtx);
  return (
    <Collapse
      {...rest}
      in={isItemSelected(activeEventKey, eventKey)}
      className={cx(className, "accordion-collapse")}
    >
      <div>{React.Children.only(children)}</div>
    </Collapse>
  );
}

export function AccordionBody({
  as: Component = "div",
  className,
  children,
  ...rest
}: HandlerProps) {
  const { eventKey } = React.useContext(AccordionItemCtx);
  return (
    <AccordionCollapse eventKey={eventKey}>
      <Component {...rest} className={cx(className, "accordion-body")}>
        {children}
      </Component>
    </AccordionCollapse>
  );
}

Accordion.Item = AccordionItem;
Accordion.Header = AccordionHeader;
Accordion.Body = AccordionBody;
Accordion.Collapse = AccordionCollapse;
Accordion.Button = AccordionButton;