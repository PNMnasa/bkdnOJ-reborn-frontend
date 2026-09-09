import * as React from "react";
import { cx, FormCtx, HandlerProps } from "./lib";
import { Col } from "./grid";

export function Form({ className, validated, as: Component = "form", ...rest }: HandlerProps) {
  return (
    <Component {...rest} className={cx(className, validated && "was-validated")} />
  );
}

export function FormGroup({ controlId, as: Component = "div", ...rest }: HandlerProps) {
  return (
    <FormCtx.Provider value={controlId ? { controlId } : {}}>
      <Component {...rest} />
    </FormCtx.Provider>
  );
}

export function FormLabel({
  as: Component = "label",
  bsPrefix = "form-label",
  column = false,
  visuallyHidden = false,
  className,
  htmlFor,
  ...rest
}: HandlerProps) {
  const { controlId } = React.useContext(FormCtx);
  let columnClass = "col-form-label";
  if (typeof column === "string") columnClass = `${columnClass} ${columnClass}-${column}`;
  const classes = cx(
    className,
    bsPrefix,
    visuallyHidden && "visually-hidden",
    column && columnClass,
  );
  const id = htmlFor || controlId;
  if (column) {
    return <Col as="label" className={classes} htmlFor={id} {...rest} />;
  }
  return <Component className={classes} htmlFor={id} {...rest} />;
}

export function FormControl({
  bsPrefix = "form-control",
  type,
  size,
  htmlSize,
  id,
  className,
  isValid = false,
  isInvalid = false,
  plaintext,
  readOnly,
  as: Component = "input",
  ...rest
}: HandlerProps) {
  const { controlId } = React.useContext(FormCtx);
  return (
    <Component
      {...rest}
      type={type}
      size={htmlSize}
      readOnly={readOnly}
      id={id || controlId}
      className={cx(
        className,
        plaintext ? `${bsPrefix}-plaintext` : bsPrefix,
        size && `${bsPrefix}-${size}`,
        type === "color" && `${bsPrefix}-color`,
        isValid && "is-valid",
        isInvalid && "is-invalid",
      )}
    />
  );
}

export function FormSelect({
  bsPrefix = "form-select",
  size,
  htmlSize,
  className,
  isValid = false,
  isInvalid = false,
  id,
  ...rest
}: HandlerProps) {
  const { controlId } = React.useContext(FormCtx);
  return (
    <select
      {...rest}
      size={htmlSize}
      className={cx(
        className,
        bsPrefix,
        size && `${bsPrefix}-${size}`,
        isValid && "is-valid",
        isInvalid && "is-invalid",
      )}
      id={id || controlId}
    />
  );
}

export function FormCheckInput({
  bsPrefix = "form-check-input",
  className,
  type = "checkbox",
  isValid = false,
  isInvalid = false,
  isStatic,
  id,
  as: Component = "input",
  ...rest
}: HandlerProps) {
  const { controlId } = React.useContext(FormCtx);
  return (
    <Component
      {...rest}
      type={type}
      id={id || controlId}
      className={cx(
        className,
        bsPrefix,
        isValid && "is-valid",
        isInvalid && "is-invalid",
        isStatic && "position-static",
      )}
    />
  );
}

export function FormCheckLabel({
  bsPrefix = "form-check-label",
  className,
  htmlFor,
  ...rest
}: HandlerProps) {
  const { controlId } = React.useContext(FormCtx);
  return <label {...rest} htmlFor={htmlFor || controlId} className={cx(className, bsPrefix)} />;
}

export function FormCheck({
  bsPrefix = "form-check",
  bsSwitchPrefix = "form-switch",
  inline = false,
  reverse = false,
  disabled = false,
  isValid = false,
  isInvalid = false,
  feedback,
  feedbackTooltip,
  feedbackType,
  className,
  style,
  title = "",
  type = "checkbox",
  label,
  children,
  id,
  as = "input",
  ...rest
}: HandlerProps) {
  const { controlId } = React.useContext(FormCtx);
  const innerFormContext = React.useMemo(
    () => ({ controlId: id || controlId }),
    [controlId, id],
  );
  const hasLabel = (children == null && label != null && label !== false) as boolean;
  return (
    <FormCtx.Provider value={innerFormContext}>
      <div
        style={style}
        className={cx(
          className,
          hasLabel && bsPrefix,
          inline && `${bsPrefix}-inline`,
          reverse && `${bsPrefix}-reverse`,
          type === "switch" && bsSwitchPrefix,
        )}
      >
        {children != null
          ? children
          : (
            <>
              <FormCheckInput
                {...rest}
                type={type === "switch" ? "checkbox" : type}
                isValid={isValid}
                isInvalid={isInvalid}
                disabled={disabled}
                as={as}
              />
              {hasLabel && <FormCheckLabel title={title}>{label}</FormCheckLabel>}
              {!!feedback && (
                <div
                  className={cx(
                    feedbackType === "invalid" ? "invalid-feedback" : "valid-feedback",
                    feedbackTooltip &&
                      (feedbackType === "invalid" ? "invalid-tooltip" : "valid-tooltip"),
                  )}
                >
                  {feedback}
                </div>
              )}
            </>
          )}
      </div>
    </FormCtx.Provider>
  );
}

Form.Group = FormGroup;
Form.Control = FormControl;
Form.Label = FormLabel;
Form.Select = FormSelect;
Form.Check = FormCheck;