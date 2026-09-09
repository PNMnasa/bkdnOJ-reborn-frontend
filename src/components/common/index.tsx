import React from "react";

import loader from "assets/common/loading.gif";
import { getCookie } from "helpers/cookies";
import { Button } from "components/bootstrap";
import { BiArrowToTop } from "components/icons";

import "./ErrorBox.css";
import "./ScrollToTopBtn.css";

interface SpinLoaderProps {
  size?: number | string;
  margin?: string;
  className?: string;
}

export class SpinLoader extends React.Component<SpinLoaderProps> {
  constructor(props: SpinLoaderProps) {
    super(props);
    this.state = {
      size: props.size || "20px",
      margin: props.margin || "0 10px",
      className: props.className,
    };
  }

  render() {
    const { size, margin, className } = this.state as { size: number | string; margin: string; className?: string };
    return (
      <img
        src={loader}
        style={{ width: String(size), height: String(size), margin }}
        className={className}
        alt="..."
      />
    );
  }
}

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

export class ErrorBox extends React.Component<ErrorBoxProps> {
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

let csrftoken = getCookie("csrftoken");

export const CSRFToken: React.FC = () => {
  return <input type="hidden" name="csrfmiddlewaretoken" value={csrftoken ?? ""} />;
};

export class ScrollToTopBtn extends React.Component {
  render() {
    return (
      <Button
        variant="light"
        size="sm"
        className="btn-svg scroll-top-btn"
        onClick={() => {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }}
      >
        <BiArrowToTop size={20} />
      </Button>
    );
  }
}

interface FileUploaderProps {
  onFileSelectSuccess: (file: File) => void;
  onFileSelectError?: (error: { error: string }) => void;
}

export const FileUploader = ({ onFileSelectSuccess, onFileSelectError }: FileUploaderProps) => {
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelectSuccess(file);
    else if (onFileSelectError) onFileSelectError({ error: "No file selected" });
  };

  return (
    <div className="file-uploader">
      <input type="file" onChange={handleFileInput} />
    </div>
  );
};