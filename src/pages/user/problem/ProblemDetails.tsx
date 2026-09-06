import React from "react";
import { connect } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import { Row, Col } from "react-bootstrap";

import {
  FaPaperPlane,
  FaSignInAlt,
  FaWrench,
  FaAlignJustify,
  FaRegFilePdf,
} from "react-icons/fa";
import { VscError } from "react-icons/vsc";

import PDFViewer from "components/PDFViewer/PDFViewer";

import contestAPI from "api/contest";
import problemAPI from "api/problem";
import { SpinLoader, RichTextEditor } from "components";
import { withParams } from "helpers/react-router";
import { setTitle } from "helpers/setTitle";

import { SubmitModal } from "pages/user/submit";

import ContestContext from "context/ContestContext";

import "./ProblemDetails.scss";

interface ProblemData {
  title?: string;
  shortname?: string;
  time_limit?: number;
  memory_limit?: number;
  allowed_languages?: { name: string }[];
  content?: string;
  pdf?: string | null;
  [key: string]: unknown;
}

interface ProblemDetailsProps {
  user: { is_staff?: boolean } | null;
  params: { shortname?: string };
  [key: string]: unknown;
}

interface ProblemDetailsState {
  data: ProblemData | null;
  loaded: boolean;
  errors: unknown;
  shortname: string;
  redirectUrl?: string;
  submitFormShow: boolean;
  probStatementType: "text" | "pdf";
  probStatementTypeDisabled: boolean;
  numPages?: number;
  contest?: Record<string, unknown>;
}

class ProblemDetails extends React.Component<ProblemDetailsProps, ProblemDetailsState> {
  static contextType = ContestContext;
  declare context: Record<string, unknown>;
  private user: { is_staff?: boolean } | null;
  private shortname: string;

  constructor(props: ProblemDetailsProps) {
    super(props);
    const { shortname } = this.props.params;
    this.shortname = shortname || "";
    this.state = {
      data: null,
      loaded: false,
      errors: null,
      shortname: shortname || "",
      redirectUrl: undefined,
      submitFormShow: false,
      probStatementType: "text",
      probStatementTypeDisabled: false,
    };
    this.user = this.props.user;
  }

  handleSubmitFormOpen() {
    this.setState({ submitFormShow: true });
  }
  handleSubmitFormClose() {
    this.setState({ submitFormShow: false });
  }

  onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    this.setState({ numPages });
  }

  toggleProbStatementType() {
    if (this.state.probStatementTypeDisabled) return;

    const { probStatementType } = this.state;
    let next: "text" | "pdf" = "text";
    if (probStatementType === "text") next = "pdf";

    this.setState({
      probStatementType: next,
      probStatementTypeDisabled: true,
    });
    setTimeout(() => this.setState({ probStatementTypeDisabled: false }), 2000);
  }

  updateContType(data: ProblemData) {
    let contType: "text" | "pdf" = "pdf";
    let contTypeSwitchDisabled = false;
    if (data.content !== "") contType = "text";
    if (data.content === "" || !data.pdf) contTypeSwitchDisabled = true;
    this.setState({
      probStatementType: contType,
      probStatementTypeDisabled: contTypeSwitchDisabled,
    });
  }

  callApi() {
    this.setState({ loaded: false, errors: null });

    let endpoint: (args: Record<string, unknown>) => Promise<{ data: ProblemData }>;
    let data: Record<string, unknown>;
    let callback = (res: { data: ProblemData }) => {};
    const prms = null;
    if (this.state.contest) {
      endpoint = contestAPI.getContestProblem as never;
      data = { key: this.state.contest.key, shortname: this.shortname };
      callback = (res) => {
        this.setState(
          {
            data: { ...res.data.problem_data, ...res.data } as ProblemData,
            loaded: true,
          },
          () => this.updateContType(this.state.data as ProblemData)
        );
        setTitle(`${String(this.state.contest?.name)} | Problem. ${res.data.title}`);
      };
    } else {
      endpoint = problemAPI.getProblemDetails as never;
      data = { shortname: this.shortname };
      callback = (res) => {
        this.setState(
          {
            data: res.data,
            loaded: true,
          },
          () => this.updateContType(this.state.data as ProblemData)
        );
        setTitle(`Problem. ${res.data.title}`);
      };
    }

    endpoint({ ...data, params: prms })
      .then((res) => {
        callback(res);
      })
      .catch((err: { response?: { data: unknown } }) => {
        this.setState({
          loaded: true,
          errors: err.response?.data || "Cannot Fetch this Problem.",
        });
      });
  }

  componentDidMount() {
    const contest = this.context.contest;
    if (contest) {
      this.setState({ contest }, () => this.callApi());
    } else this.callApi();
  }

  componentDidUpdate(_prevProps: ProblemDetailsProps, _prevState: ProblemDetailsState) {
    if (this.shortname !== this.props.params.shortname) {
      this.shortname = this.props.params.shortname || "";
      this.callApi();
    }
  }

  parseMemoryLimit() {
    return `${this.state.data?.memory_limit} KB(s)`;
  }
  parseTimeLimit() {
    return `${Number(this.state.data?.time_limit).toFixed(1)} second(s)`;
  }

  render() {
    if (this.state.redirectUrl) {
      return <Navigate to={`${this.state.redirectUrl}`} />;
    }
    const { loaded, errors, data, contest } = this.state;

    const isLoggedIn = !!this.user;
    const isInContest = !!contest;
    const isAllowedToSubmitToContest =
      isInContest &&
      ((contest as { is_registered?: boolean; spectate_allow?: boolean }).is_registered ||
        (contest as { is_registered?: boolean; spectate_allow?: boolean }).spectate_allow);
    const isStaff = isLoggedIn && !!this.user?.is_staff;

    const pdfExtraQuery = contest ? `?contest=${String(contest.key)}` : "";

    return (
      <div className="problem-info wrapper-vanilla">
        <h4 className="problem-title">
          {!loaded && (
            <span>
              <SpinLoader /> Loading...
            </span>
          )}
          {loaded && !!errors && <span>Problem Not Available</span>}
          {loaded && !errors && `Problem. ${data?.title}`}
        </h4>
        <hr />
        <div className="problem-details">
          {!loaded && (
            <span>
              <SpinLoader /> Loading...
            </span>
          )}
          {loaded && errors && (
            <>
              <div className="flex-center-col" style={{ height: "100px" }}>
                <VscError size={30} color="red" />
              </div>
            </>
          )}
          {loaded && !errors && data && (
            <>
              <Row style={{ margin: "unset" }}>
                <Col sm={9}>
                  <ul>
                    <li>
                      <strong>Problem Code:</strong>
                      {data.shortname}
                    </li>
                    <li>
                      <strong>Time Limit per test:</strong>
                      {this.parseTimeLimit()}
                    </li>
                    <li>
                      <strong>Memory Limit per test:</strong>
                      {this.parseMemoryLimit()}
                    </li>
                    <li>
                      <strong>Allowed Languages:</strong>
                      {(data.allowed_languages || []).map((lang) => lang.name).join(", ")}
                    </li>
                  </ul>
                </Col>
                <Col sm={3} className="options">
                  {
                    <Link
                      to="#"
                      className="btn"
                      style={this.state.probStatementTypeDisabled ? { color: "gray" } : {}}
                      onClick={() => this.toggleProbStatementType()}
                    >
                      {this.state.probStatementType === "pdf" && (
                        <>
                          To Text
                          <FaAlignJustify size={12} />
                        </>
                      )}
                      {this.state.probStatementType === "text" && (
                        <>
                          To PDF
                          <FaRegFilePdf size={12} />
                        </>
                      )}
                    </Link>
                  }
                  {!isLoggedIn && (
                    <Link
                      to="#"
                      className="btn"
                      onClick={() => this.setState({ redirectUrl: "/sign-in" })}
                    >
                      Sign In To Submit <FaSignInAlt size={12} />
                    </Link>
                  )}
                  {isLoggedIn &&
                    isInContest &&
                    !((contest as { is_registered?: boolean; spectate_allow?: boolean }).is_registered ||
                      (contest as { is_registered?: boolean; spectate_allow?: boolean }).spectate_allow) && (
                      <Link
                        to="#"
                        className="btn"
                        onClick={() => this.setState({ redirectUrl: "/contests" })}
                      >
                        Register to Submit <FaSignInAlt size={12} />
                      </Link>
                    )}
                  {isLoggedIn && (!isInContest || isAllowedToSubmitToContest) && (
                    <Link to="#" className="btn" onClick={() => this.handleSubmitFormOpen()}>
                      Submit <FaPaperPlane size={12} />
                    </Link>
                  )}
                  {isStaff && (
                    <Link
                      to="#"
                      className="btn"
                      style={{ color: "red" }}
                      onClick={() =>
                        this.setState({ redirectUrl: `/admin/problem/${data.shortname}` })
                      }
                    >
                      Admin <FaWrench size={12} />
                    </Link>
                  )}

                  <SubmitModal
                    show={this.state.submitFormShow}
                    onHide={() => this.handleSubmitFormClose()}
                    prob={data.shortname || ""}
                    lang={(data.allowed_languages || []) as never}
                    contest={this.context.contest as never}
                  />
                </Col>
              </Row>

              <hr className="ml-3 mr-3 mt-1 mb-1"></hr>

              <Row className="problem-statement">
                <Col>
                  {this.state.probStatementType === "pdf" && (
                    <>
                      <span className="w-100 text-right text-danger">
                        <em>
                          **Đôi khi PDF mãi loading, hãy nhấn biểu tượng Kính
                          lúp (resize) để refresh.
                        </em>
                      </span>
                      <div className="problem-pdf shadow">
                        <PDFViewer pdf={`${data.pdf}${pdfExtraQuery}`} />
                      </div>
                    </>
                  )}
                  {this.state.probStatementType === "text" &&
                    ((data.content || "").trim() === "" ? (
                      <em
                        style={{
                          minHeight: "200px",
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        Text is not available.
                      </em>
                    ) : (
                      <div className="problem-text ml-3 mr-3">
                        <RichTextEditor
                          value={data.content || ""}
                          onChange={() => {}}
                          enableEdit={false}
                        />
                      </div>
                    ))}
                </Col>
              </Row>
            </>
          )}
        </div>
      </div>
    );
  }
}

let WrappedPD = ProblemDetails as React.ComponentType<ProblemDetailsProps>;
WrappedPD = withParams(WrappedPD);
const mapStateToProps = (state: { user: { user: { is_staff?: boolean } | null } }) => {
  return { user: state.user.user };
};
WrappedPD = connect(mapStateToProps, null)(WrappedPD) as React.ComponentType<ProblemDetailsProps>;
export default WrappedPD;