import React from "react";

import "./ErrorBox.scss";

type ErrorsData = string | string[] | Record<string, unknown> | null;

interface ErrorListProps {
  errTitle: string;
  errData: string | string[] | Record<string, unknown>;
}

class ErrorList extends React.Component<ErrorListProps> {
  constructor(props: ErrorListProps) {
    super(props);
    this.state = {
      errTitle: props.errTitle,
      errData: props.errData,
    };
  }

  static getDerivedStateFromProps(nextProps: ErrorListProps, prevState: { errTitle: string; errData: unknown }) {
    if (nextProps.errTitle !== prevState.errTitle || nextProps.errData !== prevState.errData)
      return {
        errTitle: nextProps.errTitle,
        errData: nextProps.errData,
      };
    return null;
  }

  render() {
    const { errTitle, errData } = this.state as { errTitle: string; errData: string | string[] | Record<string, unknown> };
    if (errData instanceof Array) {
      return (
        <>
          <h5 key={errTitle} className="error-sub-title">
            {errTitle}
          </h5>
          <ul>
            {errData.map((err, idx) => (
              <li key={`${errTitle}-${idx}`}>
                <p>{err}</p>
              </li>
            ))}
          </ul>
        </>
      );
    } else {
      const text = typeof errData === "object" ? JSON.stringify(errData) : String(errData);
      return (
        <>
          <h5 className="error-sub-title">error</h5>
          <ul>
            <li key={`error-msg`}>
              <p>{text}</p>
            </li>
          </ul>
        </>
      );
    }
  }
}

interface ErrorBoxProps {
  errors: unknown;
}

export default class ErrorBox extends React.Component<ErrorBoxProps> {
  constructor(props: ErrorBoxProps) {
    super(props);
    this.state = { errors: props.errors };
  }

  static getDerivedStateFromProps(nextProps: ErrorBoxProps, prevState: { errors: ErrorsData }) {
    if (nextProps.errors !== prevState.errors) return { errors: nextProps.errors };
    return null;
  }

  render() {
    let { errors } = this.state as { errors: ErrorsData };
    if (!errors) return <></>;

    if (typeof errors === "string") {
      errors = { general: errors };
    } else if (errors instanceof Array) {
      errors = { errors };
    }

    let strErrors: string[] = [];
    let kwErrors: Record<string, string> = {};
    Object.keys(errors).map((key) => {
      const val = (errors as Record<string, unknown>)[key];
      if (typeof val === "string") {
        strErrors.push(val);
      } else if (val instanceof Array) {
        kwErrors = { ...kwErrors, [key]: JSON.stringify(val) };
      } else if (typeof val === "object" && !Array.isArray(val) && val !== null) {
        kwErrors = { ...kwErrors, ...(val as Record<string, string>) };
      }
    });

    return (
      <div className="error-box">
        {strErrors.map((err, idx) => (
          <div className="errors-general-text" key={`err-gnr-txt-${idx}`}>
            {err}
          </div>
        ))}
        {Object.keys(kwErrors).map((key, idx) => {
          return (
            <div key={`err-sub-${idx}`} className="error-sub">
              <ErrorList errTitle={key} errData={kwErrors[key]} />
            </div>
          );
        })}
      </div>
    );
  }
}