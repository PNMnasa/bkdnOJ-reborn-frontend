import React from "react";
import { Navigate } from "react-router";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import type { AnyAction } from "redux";

import { updateUser, clearUser } from "redux/User";
import { updateProfile } from "redux/Profile";
import { updateMyOrg } from "redux/MyOrg";

import { Row, Col, Tabs, Tab } from "components/bootstrap";

import { profileClient } from "api";

import { SpinLoader } from "components";

import "./UserProfile.css";

import { setTitle } from "helpers/setTitle";

import AboutTab from "./AboutTab";
import SettingTab from "./SettingTab";

interface UserProfileProps {
  user: unknown;
  profile: unknown;
  updateUser: (user: unknown) => void;
  updateProfile: (profile: unknown) => void;
  clearUser: () => void;
  updateMyOrg: (org: { memberOf: unknown[]; adminOf: unknown[]; selectedOrg: unknown }) => void;
}

interface UserProfileState {
  profile: {
    display_name?: string;
    user?: { username: string };
    avatar?: string;
    [key: string]: unknown;
  } | null;
  loaded: boolean;
  errors?: unknown;
  reloginNoticeShow?: boolean;
}

class UserProfile extends React.Component<UserProfileProps, UserProfileState> {
  constructor(props: UserProfileProps) {
    super(props);
    this.state = {
      profile: this.props.profile as UserProfileState["profile"],
      loaded: false,
    };
    setTitle("Profile");
  }

  fetch() {
    this.setState({ profile: null, loaded: false });

    setTimeout(
      () =>
        profileClient
          .fetchProfile()
          .then((res) => {
            this.setState({
              profile: res.data,
              loaded: true,
            });
            this.props.updateUser({ ...res.data.user, avatar: res.data.avatar });
            this.props.updateProfile({ ...res.data });
          })
          .catch((err: { response?: { data: unknown } }) => {
            this.setState({
              loaded: true,
              errors: { errors: err.response?.data || ["Cannot authenticate."] },
            });
          }),
      1000
    );
  }

  componentDidMount() {
    this.fetch();
    setTimeout(() => this.setState({ reloginNoticeShow: true }), 7000);
  }

  render() {
    const { profile, loaded } = this.state;
    if (!loaded) {
      return (
        <div className="user-profile-container shadow rounded">
          <h4 className="title">Loading</h4>
          <div className="loading-wrapper flex-center-col">
            <SpinLoader className="user-profile spinloading" size={30} margin="0" />
            {this.state.reloginNoticeShow && (
              <em className="p-2">
                Hãy thử Đăng nhập lại nếu Loading mất quá nhiều thời gian.
              </em>
            )}
          </div>
        </div>
      );
    }

    if (!profile) {
      this.props.clearUser();
      toast.error("Please log-in again.", { toastId: "profile-fetch-failed" });
      return <Navigate to="/sign-in"></Navigate>;
    }

    return (
      <div className="user-profile-container shadow rounded">
        <h4 className="title">{profile.display_name}</h4>
        <Row className="profile-content pt-3 pb-3">
          <Col md={3} className="flex-center-col">
            <img
              src={profile.avatar}
              className="avatar"
              alt={`User ${profile.user?.username}'s avatar`}
            />
            <h5 className="pt-2">{profile.user?.username}</h5>
          </Col>

          <Col md={9} className="text-left tabs-wrapper">
            <Tabs defaultActiveKey="about" className="profile-tabs mb-3">
              <Tab eventKey="settings" title="Settings">
                <SettingTab profile={profile} />
              </Tab>
              <Tab eventKey="about" title="About">
                <AboutTab profile={profile as React.ComponentProps<typeof AboutTab>["profile"]} />
              </Tab>
            </Tabs>
          </Col>
        </Row>
      </div>
    );
  }
}

type MyOrg = { name?: string; short_name?: string; slug: string | null };

const mapStateToProps = (state: {
  user: { user: unknown };
  profile: { profile: unknown };
  myOrg: { selectedOrg: unknown; memberOf: unknown[]; adminOf: unknown[] };
}) => {
  return {
    user: state.user.user,
    profile: state.profile.profile,
    myOrg: state.myOrg,
    selectedOrg: state.myOrg.selectedOrg,
  };
};

const mapDispatchToProps = (dispatch: (action: AnyAction) => void) => {
  return {
    updateUser: (user: unknown) =>
      dispatch(updateUser({ user: user as Record<string, unknown> | null })),
    updateProfile: (profile: unknown) =>
      dispatch(updateProfile({ profile: profile as Record<string, unknown> | null })),
    clearUser: () => dispatch(clearUser()),
    updateMyOrg: ({
      memberOf,
      adminOf,
      selectedOrg,
    }: {
      memberOf: MyOrg[];
      adminOf: MyOrg[];
      selectedOrg?: MyOrg;
    }) => dispatch(updateMyOrg({ memberOf, adminOf, selectedOrg })),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  UserProfile as React.ComponentType<any>
) as React.ComponentType<any>;