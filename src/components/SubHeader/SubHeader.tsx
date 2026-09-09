import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router";
import { Container } from "react-bootstrap";

import { FaGlobe, FaUniversity } from "components/icons";


import { SwitchOrgModal } from "components";

import "./SubHeader.css";

interface AuthUser {
  [key: string]: unknown;
}

interface SelectedOrg {
  slug?: string | null;
}

interface SubHeaderProps {
  user: AuthUser | null;
  selectedOrg: SelectedOrg;
}

interface SubHeaderState {
  curTime: string;
  orgModalShow: boolean;
}

class SubHeader extends React.Component<SubHeaderProps, SubHeaderState> {
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(props: SubHeaderProps) {
    super(props);
    this.state = {
      curTime: new Date().toLocaleString(),
      orgModalShow: false,
    };
  }
  toggleOrgModal(bool: boolean) {
    this.setState({ orgModalShow: bool });
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      this.setState({
        curTime: new Date().toLocaleString(),
      });
    }, 1000);
  }
  componentWillUnmount() {
    if (this.timer) clearInterval(this.timer);
  }

  render() {
    const { selectedOrg, user } = this.props;
    const isLoggedIn = !!user;

    return (
      <div className="subheader expand-sm">
        <Container className="h-100 d-flex justify-content-between">
          <div className="float-left">
            <span className="left-padder d-none d-md-inline">{"Viewing As >>"}</span>

            <Link
              to="#"
              className="d-inline-flex"
              onClick={() => {
                if (isLoggedIn) this.toggleOrgModal(true);
              }}
            >
              <span className="d-inline-flex justify-content-center align-items-center text-dark">
                {selectedOrg.slug ? (
                  <div className="org-display org-uni">
                    <FaUniversity size={14} />
                  </div>
                ) : (
                  <div className="org-display org-none">
                    <FaGlobe size={14} />
                  </div>
                )}
                {selectedOrg.slug || "Global"}
              </span>
            </Link>
          </div>

          <div className="float-right">
            <span>{this.state.curTime}</span>
          </div>
        </Container>
        <SwitchOrgModal show={this.state.orgModalShow} setShow={(b: boolean) => this.toggleOrgModal(b)} />
      </div>
    );
  }
}

const mapStateToProps = (state: {
  user: { user: AuthUser | null };
  myOrg: { selectedOrg: SelectedOrg };
}) => {
  return {
    user: state.user.user,
    selectedOrg: state.myOrg.selectedOrg,
  };
};

export default connect(mapStateToProps, null)(SubHeader);