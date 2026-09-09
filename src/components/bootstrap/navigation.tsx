import * as React from "react";
import { cx, DropdownCtx, HandlerProps, SelectableCtx, SelectableProps, TogglerProps, makeEventKey, NavCtx, NavbarCtx } from "./lib";
import { Button } from "./controls";
import { Collapse } from "./collapse";

export function Nav({
  as: Component = "div",
  variant,
  fill,
  justify,
  navbar,
  className,
  children,
  activeKey,
  onSelect,
  ...rest
}: HandlerProps) {
  const navbarContext = React.useContext(NavbarCtx);
  const isNavbar = navbar != null ? !!navbar : navbarContext != null;
  const prefix = isNavbar ? "navbar-nav" : "nav";
  const classes = cx(
    className,
    prefix,
    variant && `${prefix}-${variant}`,
    fill && `${prefix}-fill`,
    justify && `${prefix}-justified`,
  );
  return (
    <NavCtx.Provider value={{ activeKey, onSelect }}>
      <Component {...rest} className={classes}>
        {children}
      </Component>
    </NavCtx.Provider>
  );
}

export function NavItem({
  className,
  as: Component = "div",
  ...rest
}: HandlerProps) {
  return <Component {...rest} className={cx(className, "nav-item")} />;
}

export function NavLink({
  bsPrefix = "nav-link",
  className,
  as: Component = "a",
  active,
  eventKey,
  disabled = false,
  onClick,
  href,
  ...rest
}: HandlerProps) {
  const navContext = React.useContext(NavCtx);
  const selectable = React.useContext(SelectableCtx);
  const key = makeEventKey(eventKey, href);
  const isActive = active != null ? active : navContext?.activeKey === key;
  const handleClick = (e: React.SyntheticEvent) => {
    onClick?.(e as any);
    if (!disabled) {
      navContext?.onSelect?.(key, e);
      selectable?.(key, e);
    }
  };
  return (
    <Component
      {...rest}
      onClick={handleClick}
      disabled={disabled}
      href={href}
      className={cx(className, bsPrefix, disabled && "disabled", isActive && "active")}
    >
      {rest.children}
    </Component>
  );
}

Nav.Item = NavItem;
Nav.Link = NavLink;

function getDefaultActiveKey(children: any): unknown {
  let defaultActiveKey: unknown;
  React.Children.forEach(children, (child) => {
    if (defaultActiveKey == null && React.isValidElement(child) && (child as any).props?.eventKey) {
      defaultActiveKey = (child as any).props.eventKey;
    }
  });
  return defaultActiveKey;
}

export function Tabs({
  id,
  activeKey: propKey,
  defaultActiveKey,
  onSelect,
  className,
  variant = "tabs",
  children,
  ...rest
}: SelectableProps) {
  const [stateKey, setStateKey] = React.useState<unknown>(
    defaultActiveKey != null ? defaultActiveKey : getDefaultActiveKey(children),
  );
  const activeKey = propKey !== undefined ? propKey : stateKey;
  const setKey = (k: unknown, e: React.SyntheticEvent) => {
    if (propKey === undefined) setStateKey(k);
    onSelect?.(k, e);
  };
  const tabs = React.Children.toArray(children).filter(
    (c) => React.isValidElement(c) && (c.type as any) === Tab,
  );
  return (
    <>
      <Nav
        as="ul"
        id={id}
        role="tablist"
        variant={variant}
        className={cx(className, "pl-2")}
        activeKey={activeKey}
        onSelect={setKey}
        {...rest}
      >
        {tabs.map((tab, index) => {
          const tabProps = (tab as React.ReactElement<any>).props ?? {};
          const active = activeKey === tabProps.eventKey;
          return (
            <NavItem as="li" role="presentation" key={tabProps.key ?? `nav-${index}`}>
              <NavLink
                as="button"
                type="button"
                role="tab"
                eventKey={tabProps.eventKey}
                disabled={tabProps.disabled}
                active={active}
                className={tabProps.tabClassName}
                id={id ? `${id}-tab-${index}` : undefined}
                aria-controls={id ? `${id}-tab-${index}-pane` : undefined}
                aria-selected={active}
                onClick={tabProps.onClick}
                tabIndex={active ? 0 : -1}
              >
                {tabProps.title}
              </NavLink>
            </NavItem>
          );
        })}
      </Nav>
      <div className="tab-content">
        {tabs.map((tab, index) => {
          const tabProps = (tab as React.ReactElement<any>).props ?? {};
          const active = activeKey === tabProps.eventKey;
          return (
            <div
              key={tabProps.key ?? `pane-${index}`}
              role="tabpanel"
              id={id ? `${id}-tab-${index}-pane` : undefined}
              aria-labelledby={id ? `${id}-tab-${index}` : undefined}
              className={cx("tab-pane", "fade", active && "show active")}
            >
              {tabProps.children}
            </div>
          );
        })}
      </div>
    </>
  );
}

export function Tab(props: any) {
  if (props) {
    throw new Error(
      "Tabs must be instantiated with an ancestor `Tabs` component.",
    );
  }
  return null;
}

export function Dropdown({
  bsPrefix = "dropdown",
  drop = "down",
  show: propShow,
  defaultShow = false,
  onToggle,
  onSelect,
  as: Component = "div",
  className,
  ...rest
}: SelectableProps & TogglerProps) {
  const [stateShow, setStateShow] = React.useState(defaultShow);
  const show = propShow !== undefined ? propShow : stateShow;
  const setShow = (next: boolean) => {
    if (propShow === undefined) setStateShow(next);
    onToggle?.(next);
  };
  const directionClasses: Record<string, string> = {
    down: bsPrefix,
    "down-centered": `${bsPrefix}-center`,
    up: "dropup",
    "up-centered": "dropup-center dropup",
    end: "dropend",
    start: "dropstart",
  };
  const rootRef = React.useRef<HTMLElement | null>(null);
  React.useEffect(() => {
    if (!show) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [show]);
  return (
    <DropdownCtx.Provider value={{ show, setShow, onSelect }}>
      <Component ref={rootRef} {...rest} className={cx(className, show && "show", directionClasses[drop])} />
    </DropdownCtx.Provider>
  );
}

export function DropdownToggle({
  bsPrefix = "dropdown-toggle",
  split,
  className,
  childBsPrefix,
  as: Component = Button,
  ...rest
}: HandlerProps) {
  const ctx = React.useContext(DropdownCtx);
  if (childBsPrefix !== undefined) rest.bsPrefix = childBsPrefix;
  const handleClick = (e: React.MouseEvent) => {
    rest.onClick?.(e);
    ctx?.setShow(!ctx.show);
  };
  return (
    <Component
      className={cx(className, bsPrefix, split && `${bsPrefix}-split`, ctx?.show && "show")}
      aria-expanded={ctx?.show}
      onClick={handleClick}
      {...rest}
    />
  );
}

export function DropdownMenu({
  bsPrefix = "dropdown-menu",
  className,
  show: showProp,
  renderOnMount,
  align,
  variant,
  as: Component = "div",
  ...rest
}: HandlerProps) {
  const ctx = React.useContext(DropdownCtx);
  const [hasShown, setHasShown] = React.useState(false);
  const show = showProp !== undefined ? showProp : !!ctx?.show;
  React.useEffect(() => {
    if (show) setHasShown(true);
  }, [show]);
  const isNavbar = React.useContext(NavbarCtx) != null;
  if (!hasShown && !renderOnMount) return null;

  let alignEnd = false;
  const alignClasses: string[] = [];
  if (align === "end") {
    alignEnd = true;
  } else if (align && typeof align === "object") {
    const keys = Object.keys(align);
    if (keys.length) {
      const brkPoint = keys[0];
      const direction = align[brkPoint];
      alignEnd = direction === "start";
      alignClasses.push(`${bsPrefix}-${brkPoint}-${direction}`);
    }
  }
  return (
    <Component
      {...rest}
      {...(alignClasses.length > 0 || isNavbar ? { "data-bs-popper": "static" } : {})}
      className={cx(
        className,
        bsPrefix,
        show && "show",
        alignEnd && `${bsPrefix}-end`,
        variant && `${bsPrefix}-${variant}`,
        ...alignClasses,
      )}
    />
  );
}

export function DropdownItem({
  bsPrefix = "dropdown-item",
  className,
  eventKey,
  disabled = false,
  onClick,
  active,
  href,
  as: Component = "a",
  ...rest
}: HandlerProps) {
  const ctx = React.useContext(DropdownCtx);
  const isActive = active != null ? !!active : false;
  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick?.(e);
    ctx?.onSelect?.(eventKey, e);
    ctx?.setShow(false);
  };
  return (
    <Component
      {...rest}
      onClick={handleClick}
      href={href}
      className={cx(className, bsPrefix, isActive && "active", disabled && "disabled")}
    />
  );
}

export function DropdownDivider({ as: Component = "div", className, ...rest }: HandlerProps) {
  return <Component {...rest} className={cx(className, "dropdown-divider")} />;
}

Dropdown.Toggle = DropdownToggle;
Dropdown.Menu = DropdownMenu;
Dropdown.Item = DropdownItem;
Dropdown.Divider = DropdownDivider;

export function NavDropdown({
  id,
  title,
  children,
  bsPrefix,
  className,
  rootCloseEvent,
  menuRole,
  disabled,
  active,
  renderMenuOnMount,
  menuVariant,
  ...rest
}: SelectableProps) {
  return (
    <Dropdown {...rest} className={cx(className, "nav-item")}>
      <Dropdown.Toggle
        id={id}
        eventKey={null}
        active={active}
        disabled={disabled}
        childBsPrefix={bsPrefix}
        as={NavLink}
      >
        {title}
      </Dropdown.Toggle>
      <Dropdown.Menu role={menuRole} renderOnMount={renderMenuOnMount} variant={menuVariant}>
        {children}
      </Dropdown.Menu>
    </Dropdown>
  );
}

NavDropdown.Item = DropdownItem;
NavDropdown.Divider = DropdownDivider;

export function Navbar({
  bsPrefix = "navbar",
  expand = true,
  variant = "light",
  bg,
  fixed,
  sticky,
  className,
  as: Component = "nav",
  expanded: propExpanded,
  defaultExpanded = false,
  onToggle,
  onSelect,
  collapseOnSelect = false,
  ...rest
}: HandlerProps) {
  const [stateExpanded, setStateExpanded] = React.useState(defaultExpanded);
  const expanded = propExpanded !== undefined ? propExpanded : stateExpanded;
  const handleExpand = (next: boolean) => {
    if (propExpanded === undefined) setStateExpanded(next);
    onToggle?.(next);
  };
  const handleCollapse = (...args: any[]) => {
    onSelect?.(...args);
    if (collapseOnSelect && expanded) handleExpand(false);
  };
  const navbarContext = React.useMemo(
    () => ({
      onToggle: () => handleExpand(!expanded),
      bsPrefix,
      expanded,
      expand,
    }),
    [bsPrefix, expanded, expand],
  );
  let expandClass = `${bsPrefix}-expand`;
  if (typeof expand === "string") expandClass = `${expandClass}-${expand}`;
  if (rest.role === undefined && Component !== "nav") {
    rest.role = "navigation";
  }
  return (
    <NavbarCtx.Provider value={navbarContext}>
      <SelectableCtx.Provider value={handleCollapse}>
        <Component
          {...rest}
          className={cx(
            className,
            bsPrefix,
            expand && expandClass,
            variant && `${bsPrefix}-${variant}`,
            bg && `bg-${bg}`,
            sticky && `sticky-${sticky}`,
            fixed && `fixed-${fixed}`,
          )}
        />
      </SelectableCtx.Provider>
    </NavbarCtx.Provider>
  );
}

export function NavbarBrand({ bsPrefix, className, as, href, ...rest }: HandlerProps) {
  bsPrefix = bsPrefix ?? "navbar-brand";
  const Component = as || (href ? "a" : "span");
  return <Component {...rest} href={href} className={cx(className, bsPrefix)} />;
}

export function NavbarToggle({
  bsPrefix,
  className,
  children,
  label = "Toggle navigation",
  as: Component = "button",
  onClick,
  ...rest
}: HandlerProps) {
  bsPrefix = bsPrefix ?? "navbar-toggler";
  const navbarContext = React.useContext(NavbarCtx);
  const handleClick = (e: React.MouseEvent) => {
    onClick?.(e);
    navbarContext?.onToggle();
  };
  const props = Component === "button" ? { type: "button" } : {};
  return (
    <Component
      {...rest}
      {...props}
      onClick={handleClick}
      aria-label={label}
      className={cx(className, bsPrefix, !navbarContext?.expanded && "collapsed")}
    >
      {children || <span className={`${bsPrefix}-icon`} />}
    </Component>
  );
}

export function NavbarCollapse({ children, bsPrefix, ...rest }: HandlerProps) {
  bsPrefix = bsPrefix ?? "navbar-collapse";
  const navbarContext = React.useContext(NavbarCtx);
  return (
    <Collapse {...rest} in={!!navbarContext?.expanded}>
      <div className={bsPrefix}>{children}</div>
    </Collapse>
  );
}

Navbar.Brand = NavbarBrand;
Navbar.Toggle = NavbarToggle;
Navbar.Collapse = NavbarCollapse;