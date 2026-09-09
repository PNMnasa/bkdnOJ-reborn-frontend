import React from "react";
import { connect } from "react-redux";
import type { AnyAction } from "redux";

import { Navigate } from "react-router";
import { Form } from "components/bootstrap";

import { SpinLoader } from "components/common";

import { authClient } from "api";
import { clearUser } from "redux/User";

import "./SignOut.css";

interface SignOutProps {
  clearUser: () => void;
}

interface SignOutState {
  redirect: boolean;
}

class SignOut extends React.Component<SignOutProps, SignOutState> {
  constructor(props: SignOutProps) {
    super(props);
    this.state = {
      redirect: false,
    };
  }

  componentDidMount() {
    authClient
      .signOut()
      .then(() => {
        this.props.clearUser();
      })
      .catch(() => {
        this.props.clearUser();
      })
      .finally(() => {
        this.setState({redirect: true});
      });
  }

  render() {
    const {redirect} = this.state;
    if (redirect) return <Navigate to="/" />;

    return (
      <Form className="sign-out-form shadow rounded">
        <h5>
          Signing Out <SpinLoader />
        </h5>
      </Form>
    );
  }
}

const mapDispatchToProps = (dispatch: (action: AnyAction) => void) => {
  return {
    clearUser: () => dispatch(clearUser()),
  };
};

export default connect(null, mapDispatchToProps)(SignOut) as React.ComponentType<any>;