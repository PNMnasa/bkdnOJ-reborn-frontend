import React from "react";
import {toast} from "react-toastify";
import {connect} from "react-redux";
import {Navigate} from "react-router";
import {Button, Tabs, Tab} from "components/bootstrap";

import { FaGlobe, FaRegTrashAlt, FaSyncAlt } from "components/icons";


import { problemClient } from "api";
import {SpinLoader, ErrorBox} from "components";
import {withParams} from "helpers/react-router";
import {setTitle} from "helpers/setTitle";

import GeneralDetails from "./GeneralDetails";
import TestDataDetails from "./TestDataDetails";
import TestcaseDetails from "./TestcaseDetails";

import "./AdminProblemDetails.css";

interface RejudgeButtonProps {
  shortname: string;
  setErrors?: (e: unknown) => void;
}

interface RejudgeButtonState {
  judgeInfo: string | null;
  fetchingInfo: boolean;
  confirmRejudge: boolean;
}

class RejudgeButton extends React.Component<RejudgeButtonProps, RejudgeButtonState> {
  constructor(props: RejudgeButtonProps) {
    super(props);
    this.state = {
      judgeInfo: null,
      fetchingInfo: false,
      confirmRejudge: false,
    };
  }

  fetchRejudgeInfo() {
    const data = {shortname: this.props.shortname};
    this.setState({fetchingInfo: true}, () => {
      problemClient
        .infoRejudgeProblem(data)
        .then(res => {
          this.setState({judgeInfo: res.data.msg}, () => {
            let conf = window.confirm(res.data.msg + " Proceed?");
            this.setState({confirmRejudge: conf});
          });
        })
        .catch((err: { response?: { status: number; data: { detail?: string } } }) => {
          let msg = `Cannot get rejudge info. ${err.response?.status}`;
          if (err.response?.data?.detail) msg = err.response.data.detail;
          toast.error(msg);
        })
        .finally(() => this.setState({fetchingInfo: false}));
    });
  }

  componentDidUpdate(_prevProps: RejudgeButtonProps, prevState: RejudgeButtonState) {
    if (
      prevState.confirmRejudge === false &&
      this.state.confirmRejudge === true
    ) {
      const data = {shortname: this.props.shortname, data: {}};
      problemClient
        .rejudgeProblem(data)

        .then(() => toast.success(`OK Rejudging ${this.props.shortname}.`))
        .catch(() => toast.error("Cannot rejudge at the moment."));
    }
  }

  clickHandler(e: React.MouseEvent) {
    e.preventDefault();
    if (this.state.confirmRejudge) {
      alert("Please refresh if you want to re-rejudge this problem.");
      return;
    }
    this.fetchRejudgeInfo();
  }

  render() {
    const {fetchingInfo, confirmRejudge} = this.state;

    return (
      <Button
        className="btn-svg"
        size="sm"
        variant={!confirmRejudge ? "success" : "light"}
        onClick={e => this.clickHandler(e)}
      >
        <FaSyncAlt />
        <span className="d-none d-md-inline">
          {fetchingInfo ? <SpinLoader margin="0" /> : <>Rejudge</>}
        </span>
      </Button>
    );
  }
}

interface ProblemData {
  shortname: string;
  title: string;
  [key: string]: unknown;
}

interface AdminProblemDetailsProps {
  params: Record<string, string | undefined>;
  user?: unknown;
}

interface AdminProblemDetailsState {
  loaded: boolean;
  errors: unknown;
  options: unknown;
  problemTitle: string | undefined;
  general: ProblemData | undefined;
  testData: unknown;
  formErrors: unknown;
  redirectUrl?: string;
  shortname?: string;
  childKey?: number;
}

class AdminProblemDetails extends React.Component<AdminProblemDetailsProps, AdminProblemDetailsState> {
  shortname: string;

  constructor(props: AdminProblemDetailsProps) {
    super(props);
    const {shortname} = this.props.params;
    this.shortname = shortname!;
    this.state = {
      loaded: false,
      errors: null,
      options: undefined,
      problemTitle: undefined,
      general: undefined,
      testData: undefined,

      formErrors: null,
    };
  }
  refetch(newshortname: string | null = null) {
    let childKey = this.state.childKey;
    if (newshortname) {
      this.shortname = newshortname;
      childKey = Math.random();
    }

    Promise.all([
      problemClient.getProblemDetails({shortname: this.shortname}),
    ])
      .then(res => {
        const [generalRes] = res;
        this.setState({
          shortname: generalRes.data.shortname,
          problemTitle: generalRes.data.title,
          general: generalRes.data,
          loaded: true,
          childKey,
        });
        setTitle(`Admin | Problem. ${generalRes.data.shortname}`);
      })
      .catch((err: { response?: { data: unknown } }) => {
        this.setState({
          loaded: true,
          errors: err.response?.data,
        });
      });
  }

  componentDidMount() {
    this.refetch();
  }

  deleteObjectHandler() {
    let conf = window.confirm("Are you sure you want to delete this problem?");
    if (conf) {
      problemClient
        .adminDeleteProblem({shortname: this.shortname})
        .then(() => {
          toast.success("OK Deleted.");
          this.setState({redirectUrl: "/admin/problems"});
        })
        .catch((err: unknown) => {
          toast.error(`Cannot delete. (${err})`);
        });
    }
  }

  render() {
    if (this.state.redirectUrl) {
      return <Navigate to={`${this.state.redirectUrl}`} />;
    }
    const {loaded, errors, general} = this.state;
    const {formErrors} = this.state;

    return (
      <div className="admin problem-panel wrapper-vanilla">
        <h4 className="problem-title">
          {!loaded && (
            <span>
              <SpinLoader /> Loading...
            </span>
          )}
          {loaded && !!errors && <span>Something went wrong</span>}
          {loaded && !errors && (
            <div className="panel-header">
              <span className="title-text">{`Problem | ${this.state.problemTitle}`}</span>
              <span>
                <RejudgeButton
                  shortname={general!.shortname}
                  setErrors={(e: unknown) => this.setState({errors: e})}
                />
              </span>
              <span>
                <Button
                  className="btn-svg"
                  size="sm"
                  variant="dark"
                  onClick={() =>
                    this.setState({redirectUrl: `/problem/${this.shortname}`})
                  }
                >
                  <FaGlobe />
                  <span className="d-none d-md-inline">View on Site</span>
                </Button>
              </span>
              <span>
                <Button
                  className="btn-svg"
                  size="sm"
                  variant="danger"
                  onClick={() => this.deleteObjectHandler()}
                >
                  <FaRegTrashAlt />
                  <span className="d-none d-md-inline">Delete</span>
                </Button>
              </span>
            </div>
          )}
        </h4>
        <hr />
        <div className="problem-details">
          {!loaded && (
            <span>
              <SpinLoader /> Loading...
            </span>
          )}

          {loaded && !errors && (
            <>
              <ErrorBox errors={formErrors} />
              <Tabs defaultActiveKey="general" id="prob-tabs" className="pl-2">
                <Tab eventKey="general" title="General">
                  <GeneralDetails
                    shortname={this.shortname}
                    data={general!}
                    setProblemTitle={(title: string) =>
                      this.setState({problemTitle: title})
                    }
                    setErrors={(e: unknown) => this.setState({formErrors: e})}
                    refetch={(newshort: string) => this.refetch(newshort)}
                  />
                </Tab>
                <Tab eventKey="data" title="Test Data">
                  <TestDataDetails
                    key={`prb-dt-data${this.state.childKey}`}
                    shortname={this.shortname}
                    setErrors={(e: unknown) => this.setState({formErrors: e})}
                    forceRerender={() =>
                      this.setState({childKey: Math.random()})
                    }
                  />
                </Tab>
                <Tab eventKey="test" title="Test Cases">
                  <TestcaseDetails
                    key={`prb-dt-case${this.state.childKey}`}
                    shortname={this.shortname}
                    setErrors={(e: unknown) => this.setState({formErrors: e})}
                    forceRerender={() =>
                      this.setState({childKey: Math.random()})
                    }
                  />
                </Tab>
              </Tabs>
            </>
          )}
        </div>
      </div>
    );
  }
}

let wrappedPD: React.ComponentType<any> = AdminProblemDetails;
wrappedPD = withParams(wrappedPD);
const mapStateToProps = (state: { user: { user: unknown } }) => {
  return {user: state.user.user};
};
wrappedPD = connect(mapStateToProps, null)(wrappedPD);
export default wrappedPD;
