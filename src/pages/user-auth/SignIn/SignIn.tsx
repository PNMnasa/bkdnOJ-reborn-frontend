import React from "react";
import { connect } from "react-redux";

import { Navigate } from "react-router-dom";
import { Form, Button, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";

import { updateUser, clearUser } from "redux/User/actions";

import authClient from "api/auth";
import SpinLoader from "components/SpinLoader/SpinLoader";
import ErrorBox from "components/ErrorBox/ErrorBox";

import "./SignIn.scss";

import {
  __ls_set_access_token,
  __ls_set_refresh_token,
  __ls_set_auth_user,
} from "helpers/localStorageHelpers";

import { setTitle } from "helpers/setTitle";
import { log } from "helpers/logger";

interface SignInProps {
  user: unknown;
  updateUser: (user: unknown) => void;
  clearUser: () => void;
}

interface SignInState {
  username: string;
  password: string;
  submitted: boolean;
  errors: unknown;
  redirect: boolean;
}

class SignIn extends React.Component<SignInProps, SignInState> {
  constructor(props: SignInProps) {
    super(props);
    this.state = {
      username: "",
      password: "",
      submitted: false,
      errors: null,
      redirect: false,
    };
    setTitle("Sign In");
  }

  submitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (this.state.submitted) {
      log("Already submitted. Please wait for response.");
      return false;
    }
    this.setState({ submitted: true });

    const data = { username: this.state.username, password: this.state.password };
    toast
      .promise(authClient.signIn(data), {
        pending: {
          render() {
            return "Signing in...";
          },
        },
        success: {
          render({ data }: { data: { data: { access: string; refresh: string; user: unknown } } }) {
            __ls_set_access_token(data.data.access);
            __ls_set_refresh_token(data.data.refresh);
            __ls_set_auth_user(data.data.user);
            return "Welcome back.";
          },
        },
        error: {
          render({ data }: { data: { response: { data: unknown } } }) {
            return "Sign-in Failed!";
          },
        },
      })
      .finally(() => this.setState({ submitted: false }));
  }

  render() {
    const { errors } = this.state;
    const LEFT_COL = 3;
    const RIGHT_COL = 12 - LEFT_COL;

    if (this.props.user) return <Navigate to="/profile" replace />;

    return (
      <Form
        className="sign-in-form shadow rounded"
        onSubmit={(e) => this.submitHandler(e)}
      >
        <fieldset className="disabled-on-submit-wrapper" disabled={this.state.submitted}>
          <h4>Sign In</h4>
          <ErrorBox errors={errors as never} />
          <Form.Group as={Row} className="mb-2" controlId="formPlaintextUsername">
            <Form.Label column sm={LEFT_COL} className="required">
              Username
            </Form.Label>
            <Col sm={RIGHT_COL}>
              <Form.Control
                type="input"
                placeholder="Enter your Username"
                required
                onChange={(e) => this.setState({ username: e.target.value })}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3" controlId="formPlaintextPassword">
            <Form.Label column sm={LEFT_COL} className="required">
              Password
            </Form.Label>
            <Col sm={RIGHT_COL}>
              <Form.Control
                type="password"
                placeholder="Enter your Password"
                required
                onChange={(e) => this.setState({ password: e.target.value })}
              />
            </Col>
          </Form.Group>
          <div className="d-inline">
            <Button variant="dark" className="submit-btn" type="submit">
              {"Sign In"}
            </Button>
            {this.state.submitted ? <SpinLoader size={20} margin="0 10px" /> : <></>}
          </div>
        </fieldset>
      </Form>
    );
  }
}

const mapStateToProps = (state: { user: { user: unknown } }) => {
  return {
    user: state.user.user,
  };
};

const mapDispatchToProps = (dispatch: (action: unknown) => void) => {
  return {
    updateUser: (user: unknown) => dispatch(updateUser({ user })),
    clearUser: () => dispatch(clearUser()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SignIn);