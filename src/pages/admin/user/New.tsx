import React from "react";
import {connect} from "react-redux";
import {Navigate} from "react-router";
import {Tabs, Tab} from "react-bootstrap";

import {withParams} from "helpers/react-router";
import UserFromFile from "./newtabs/UserFromFile";
import {setTitle} from "helpers/setTitle";

import "./Details.css";

interface AdminJudgeDetailsProps {
  params: Record<string, string | undefined>;
  user?: unknown;
}

interface AdminJudgeDetailsState {
  loaded: boolean;
  errors: unknown;
  data: undefined;
  redirectUrl: string | null;
}

class AdminJudgeDetails extends React.Component<AdminJudgeDetailsProps, AdminJudgeDetailsState> {
  constructor(props: AdminJudgeDetailsProps) {
    super(props);
    this.state = {
      loaded: false,
      errors: null,
      data: undefined,
      redirectUrl: null,
    };
  }

  setRedirect(url: string) {
    this.setState({redirectUrl: url});
  }

  componentDidMount() {
    setTitle(`Admin | Users`);
  }

  render() {
    if (this.state.redirectUrl)
      return <Navigate to={`${this.state.redirectUrl}`} />;

    return (
      <div className="admin user-panel wrapper-vanilla">
        <h4 className="user-title">
          <div className="panel-header">
            <span className="title-text">+ Creating User</span>
            <span></span>
          </div>
        </h4>
        <hr />
        <div className="user-details">
          <Tabs defaultActiveKey="upload" id="new-user-tabs" className="pl-2">
            <Tab eventKey="upload" title="Upload CSV">
              <UserFromFile redirectTo={(url: string) => this.setRedirect(url)} />
            </Tab>
          </Tabs>
        </div>
      </div>
    );
  }
}

let wrappedPD: React.ComponentType<any> = AdminJudgeDetails;
wrappedPD = withParams(wrappedPD);
const mapStateToProps = (state: { user: { user: unknown } }) => {
  return {user: state.user.user};
};
wrappedPD = connect(mapStateToProps, null)(wrappedPD);
export default wrappedPD;
