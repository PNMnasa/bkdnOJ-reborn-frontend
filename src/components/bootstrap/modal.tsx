import * as React from "react";
import { cx, HandlerProps, HideableProps } from "./lib";

export function Modal({
  show = false,
  onHide,
  backdrop = true,
  keyboard = true,
  animation = true,
  centered,
  size,
  scrollable,
  dialogClassName,
  contentClassName,
  className,
  children,
  ...rest
}: HideableProps) {
  React.useEffect(() => {
    if (!show) return;
    const previous = document.body.style.overflow;
    document.body.classList.add("modal-open");
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (keyboard && e.key === "Escape") onHide?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [show, keyboard, onHide]);

  if (!show) return null;
  return (
    <>
      {backdrop && <div className="modal-backdrop fade show" />}
      <div
        {...rest}
        className={cx("modal", animation && "fade", "show", className)}
        style={{ display: "block" }}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        onMouseDown={
          backdrop
            ? (e: React.MouseEvent) => {
                if (e.target === e.currentTarget) onHide?.();
              }
            : undefined
        }
      >
        <div
          className={cx(
            "modal-dialog",
            size && `modal-${size}`,
            centered && "modal-dialog-centered",
            scrollable && "modal-dialog-scrollable",
            dialogClassName,
          )}
        >
          <div className={cx("modal-content", contentClassName)}>{children}</div>
        </div>
      </div>
    </>
  );
}

export function ModalHeader({ className, children, ...rest }: HandlerProps) {
  return (
    <div {...rest} className={cx("modal-header", className)}>
      {children}
    </div>
  );
}

export function ModalTitle({ as, className, children, ...rest }: HandlerProps) {
  const Component = as ?? "div";
  return (
    <Component {...rest} className={cx("modal-title", as == null && "h4", className)}>
      {children}
    </Component>
  );
}

export function ModalBody({ className, children, ...rest }: HandlerProps) {
  return (
    <div {...rest} className={cx("modal-body", className)}>
      {children}
    </div>
  );
}

export function ModalFooter({ className, children, ...rest }: HandlerProps) {
  return (
    <div {...rest} className={cx("modal-footer", className)}>
      {children}
    </div>
  );
}

Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;