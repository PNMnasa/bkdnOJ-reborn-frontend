import React from "react";
import { connect } from "react-redux";
import type { AnyAction } from "redux";
import { toast } from "react-toastify";

import { Nav, NavDropdown } from "react-bootstrap";
import { Link, Navigate } from "react-router";

import {
  AiOutlineForm,
  AiOutlineLogin,
  AiOutlineLogout,
  AiOutlineProfile,
} from "react-icons/ai";
import { GrUserAdmin } from "react-icons/gr";

import authClient from "api/auth";
import profileClient from "api/profile";

import { updateUser, clearUser } from "redux/User/actions";
import { updateProfile, clearProfile } from "redux/Profile/actions";
import { updateContest, clearContest } from "redux/Contest/actions";
import { clearMyOrg } from "redux/MyOrg/actions";

import {
  __ls_get_auth_user,
  __ls_remove_credentials,
  __ls_set_auth_user,
} from "helpers/localStorageHelpers";

import { log } from "helpers/logger";

interface AuthUser {
  username: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  [key: string]: unknown;
}

interface RootStateShape {
  user: { user: AuthUser | null };
  profile: { profile: unknown };
  contest: { contest: unknown };
}

const mapStateToProps = (state: RootStateShape) => {
  return {
    user: state.user.user,
    profile: state.profile.profile,
    contest: state.contest.contest,
  };
};

const mapDispatchToProps = (dispatch: (action: AnyAction) => void) => {
  return {
    updateUser: (user: Record<string, unknown> | null) => dispatch(updateUser({ user })),
    clearUser: () => dispatch(clearUser()),

    updateProfile: (profile: Record<string, unknown> | null) => dispatch(updateProfile({ profile })),
    clearProfile: () => dispatch(clearProfile()),
    clearMyOrg: () => dispatch(clearMyOrg()),

    updateContest: (contest: Record<string, unknown> | null) => dispatch(updateContest({ contest })),
    clearContest: () => dispatch(clearContest()),
  };
};

interface AuthorizedMenuProps {
  user: AuthUser;
  setRedirectUrl: (url: string) => void;
  updateUser: (user: Record<string, unknown> | null) => void;
  updateProfile: (profile: Record<string, unknown> | null) => void;
  updateContest: (contest: Record<string, unknown> | null) => void;
  clearUser: () => void;
  clearProfile: () => void;
  clearMyOrg: () => void;
}

class AuthorizedMenu extends React.Component<AuthorizedMenuProps> {
  componentDidMount() {
    profileClient
      .fetchProfile()
      .then((res) => {
        __ls_set_auth_user(res.data.user);
        this.props.updateUser({ ...res.data.user, avatar: res.data.avatar });
        this.props.updateProfile({ ...res.data });
        this.props.updateContest(res.data.current_contest);
      })
      .catch((err) => {
        log(err);
      });
  }

  signOutHandler() {
    authClient
      .signOut()
      .then(() => {
        this.props.clearUser();
        this.props.clearProfile();
        this.props.clearMyOrg();
        toast.success("See you later!");
      })
      .catch(() => {
        __ls_remove_credentials();
      })
      .finally(() => {
        this.props.setRedirectUrl("/");
      });
  }

  render() {
    const user = this.props.user;
    return (
      <>
        <div className="nav-link" id="fake">
          {`Hello, ${user.username}!`}
        </div>
        <NavDropdown id="nav-dropdown-userauth" title="">
          {(user.is_staff || user.is_superuser) && (
            <NavDropdown.Item as={Link} to="/admin">
              <GrUserAdmin className="react-icons" size={10} />
              Admin
            </NavDropdown.Item>
          )}
          <NavDropdown.Item as={Link} to="/profile">
            <AiOutlineProfile className="react-icons" size={10} />
            Profile
          </NavDropdown.Item>
          <NavDropdown.Divider />
          <NavDropdown.Item
            style={{ color: "red" }}
            href="#"
            onClick={() => this.signOutHandler()}
          >
            <AiOutlineLogout className="react-icons" size={10} />
            Sign Out
          </NavDropdown.Item>
        </NavDropdown>
      </>
    );
  }
}

const ReduxAuthorizedMenu = connect(mapStateToProps, mapDispatchToProps)(AuthorizedMenu as React.ComponentType<any>) as React.ComponentType<any>;

interface UserAuthSectionProps {
  user: AuthUser | null;
  updateUser: (user: Record<string, unknown> | null) => void;
}

class UserAuthSection extends React.Component<UserAuthSectionProps> {
  state = {
    redirectUrl: "",
  };

  constructor(props: UserAuthSectionProps) {
    super(props);
    const user = this.props.user || __ls_get_auth_user();
    if (!!user && !this.props.user) {
      this.props.updateUser(user);
    }
  }

  render() {
    if (this.state.redirectUrl) {
      const url = this.state.redirectUrl;
      this.setState({ redirectUrl: "" });
      return <Navigate to={url} />;
    }

    const user = this.props.user;
    if (!user)
      return (
        <>
          <Nav.Link as={Link} to="/sign-up">
            <div className="d-inline-flex align-items-center">
              <AiOutlineForm className="react-icons" size={10} />
              Sign Up
            </div>
          </Nav.Link>
          <Nav.Link as={Link} to="/sign-in">
            <div className="d-inline-flex align-items-center">
              <AiOutlineLogin className="react-icons" size={10} />
              Sign In
            </div>
          </Nav.Link>
        </>
      );

    return (
      <ReduxAuthorizedMenu
        user={user}
        setRedirectUrl={(url: string) => this.setState({ redirectUrl: url })}
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserAuthSection) as React.ComponentType<any>;