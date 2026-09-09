import React from "react";
import { Navigate } from "react-router";
import { Modal, Button } from "components/bootstrap";

import { BsExclamationCircle, BsFillLightningChargeFill, FaExternalLinkAlt, FaPaperPlane } from "components/icons";



import { shouldStopPolling, isNoTestcaseStatus } from "constants/statusFilter";

import submissionApi from "api/submission";
import SubmitForm from "./SubmitForm";
import "./SubmitModal.css";

const __SUBMIT_MODAL_POLL_DELAY = 3000;
const __SUBMIT_MODAL_MAX_POLL_DURATION = 30 * 1000;

interface TestCase {
  case: number | string;
  status: string;
  [key: string]: unknown;
}

interface SubmitModalResultProps {
  subId: number | string | null;
  subErrors?: string | null;
}

interface SubmitModalResultState {
  subId: number | string | null;
  data: { status: string; test_cases: TestCase[]; current_testcase?: number; result?: string };
  couldNotFetch: boolean;
  isPolling: boolean;
}

class SubmitModalResult extends React.Component<SubmitModalResultProps, SubmitModalResultState> {
  private timer?: ReturnType<typeof setInterval>;

  constructor(props: SubmitModalResultProps) {
    super(props);
    this.state = {
      subId: props.subId,
      data: { status: "...", test_cases: [] },
      couldNotFetch: false,
      isPolling: false,
    };
  }

  pollResult() {
    if (this.state.couldNotFetch || shouldStopPolling(this.state.data.status)) {
      this.clearTimer();
      this.setState({ isPolling: false });
      return;
    }
    submissionApi
      .getSubmissionResult({ id: this.state.subId as number | string })
      .then((res) => {
        this.setState({ data: res.data });
      })
      .catch(() => {
        this.setState({ couldNotFetch: true, isPolling: false });
      });
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  componentDidUpdate(prevProps: SubmitModalResultProps) {
    if (prevProps.subId !== this.props.subId) {
      this.setState({ subId: this.props.subId }, () => {
        this.clearTimer();
        this.setState({ isPolling: true });
        this.timer = setInterval(() => this.pollResult(), __SUBMIT_MODAL_POLL_DELAY);

        setTimeout(() => {
          this.clearTimer();
          this.setState({ isPolling: false });
        }, __SUBMIT_MODAL_MAX_POLL_DURATION);
      });
    }
  }

  clearTimer() {
    if (this.timer) clearInterval(this.timer);
  }

  render() {
    const { subErrors } = this.props;
    if (subErrors) return <div className="note">{subErrors}</div>;

    const { subId, data, couldNotFetch, isPolling } = this.state;
    if (couldNotFetch) return <div className="note">Submitted. Check Details for more info.</div>;

    if (subId === null || data.status === "...")
      return <div className="note loading_3dot">Submitting</div>;

    if (data.status !== "D" && !isPolling)
      return <div className="note">Submitted. Check Details for more info.</div>;

    if (data.status === "QU") return <div className="note loading_3dot">Queuing</div>;
    if (data.status === "P") return <div className="note loading_3dot">Processing</div>;

    if (data.status === "G") {
      return (
        <div className="note loading_3dot">{`Judging case ${data.current_testcase}`}</div>
      );
    }
    const verdict = data.status === "D" ? data.result || data.status : data.status;

    if (!isNoTestcaseStatus(verdict)) {
      for (let i = 0; i < data.test_cases.length; i++) {
        if (data.test_cases[i].status !== "AC") {
          return (
            <div className="note">
              <span>
                {"Got "}
                <span className={`verdict ${verdict.toLowerCase()}`}>
                  <span>{verdict}</span>
                </span>
                {` on case ${data.test_cases[i].case}.`}
              </span>
            </div>
          );
        }
      }
    }

    return (
      <div className="note">
        <span>
          {`Result: `}
          <span className={`verdict ${verdict.toLowerCase()}`}>
            <span>{verdict}</span>
          </span>
        </span>
      </div>
    );
  }
}

interface SubmitModalProps {
  show: boolean;
  onHide: () => void;
  prob: string;
  lang: Lang[];
  contest?: { key: string; [key: string]: unknown } | null;
}

interface Lang {
  id: number;
  name: string;
  short_name?: string;
  ace?: string;
  [key: string]: unknown;
}

interface SubmitModalState {
  subId: number | string | null;
  errors: string | null;
  redirect: boolean;
  submitting: boolean;
}

export default class SubmitModal extends React.Component<SubmitModalProps, SubmitModalState> {
  constructor(props: SubmitModalProps) {
    super(props);
    this.state = {
      subId: null,
      errors: null,
      redirect: false,
      submitting: false,
    };
  }

  setErrors(err: string) {
    this.setState({ errors: err });
  }
  setSubId(id: number | string) {
    this.setState({ subId: id });
  }

  onHide() {
    this.setState({ subId: null, submitting: false });
    this.props.onHide();
  }

  render() {
    const { contest } = this.props;

    if (!!this.state.redirect && !!this.state.subId) {
      if (contest)
        return <Navigate to={`/contest/${contest.key}/submission/${this.state.subId}`} />;
      else return <Navigate to={`/submission/${this.state.subId}`} />;
    }

    return (
      <Modal
        show={this.props.show}
        onHide={() => this.onHide()}
        className="submit-modal"
        backdrop="static"
        keyboard={false}
        size="lg"
      >
        <Modal.Header>
          <Modal.Title>
            {`Submit ${contest ? `to ${contest.key}` : ""}`}
            <BsFillLightningChargeFill size={20} />
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <SubmitForm
            prob={this.props.prob}
            lang={this.props.lang}
            contest={this.props.contest}
            submitting={this.state.submitting}
            setSubId={(subId: number | string) => this.setSubId(subId)}
            setSubErrors={(err: string) => this.setErrors(err)}
          />
        </Modal.Body>

        <Modal.Footer>
          <div className="note">
            {!this.state.submitting ? (
              <>
                <div
                  style={{
                    height: "100%",
                    width: "auto",
                    margin: "auto",
                    display: "flex",
                    verticalAlign: "center",
                  }}
                >
                  <BsExclamationCircle />
                </div>
                <span className="warning">This editor only store your most recent code!</span>
              </>
            ) : (
              <SubmitModalResult subId={this.state.subId} subErrors={this.state.errors} />
            )}
          </div>

          <Button variant="secondary" onClick={() => this.onHide()}>
            Close
          </Button>

          {this.state.subId === null ? (
            <Button
              variant="dark"
              onClick={() => this.setState({ submitting: true })}
              disabled={this.state.submitting}
            >
              {"Submit "}
              <FaPaperPlane size={12} />
            </Button>
          ) : (
            <Button variant="dark" onClick={() => this.setState({ redirect: true })}>
              {"Details "}
              <FaExternalLinkAlt size={12} />
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    );
  }
}