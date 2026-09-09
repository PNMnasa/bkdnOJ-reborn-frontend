import React from "react";
import {Button} from "components/bootstrap";
import {Navigate, Outlet} from "react-router";

import { VscThreeBars } from "components/icons";


import { authClient } from "api";
import {addClass, removeClass} from "helpers/dom_functions";
import {setTitle} from "helpers/setTitle";

import AdminNav from "./nav/AdminNav";
import "./AdminApp.css";

interface AdminAppState {
  authorized: boolean;
  loaded: boolean;
  sidebarClosed: boolean;
  redirectUrl: string | null;
}

class AdminApp extends React.Component<Record<string, never>, AdminAppState> {
  constructor(props: Record<string, never>) {
    super(props);

    this.state = {
      authorized: false,
      loaded: false,
      sidebarClosed: false,
      redirectUrl: null,
    };
  }
  hideSidebar() {
    let sidebar = document.getElementById("admin-sidebar");
    const bool = this.state.sidebarClosed;
    this.setState({sidebarClosed: !bool}, () => {
      if (bool) removeClass(sidebar!, "d-none");
      else addClass(sidebar!, "d-none");
    });
  }
  componentDidMount() {
    authClient
      .whoAmI()
      .then(res => {
        const user = res.data && res.data.user;
        this.setState({
          loaded: true,
          authorized: !!(user.is_staff || user.is_superuser),
        });
      })
      .catch(() => {
        this.setState({loaded: true});
      });
  }

  render() {
    if (!this.state.loaded) return <></>;
    if (!this.state.authorized) return <Navigate to="/404" replace />;
    setTitle("Admin | Dashboard");

    return (
      <div className="admin-page">
        <AdminNav className="d-none" />
        <div id="admin-content-wrapper">
          <div id="admin-topbar" className="shadow">
            <Button
              variant="light"
              onClick={() => this.hideSidebar()}
              id="sidebar-toggle-btn"
            >
              <VscThreeBars />
            </Button>

            <span></span>
          </div>
          <div id="admin-panel-container">
            <Outlet />
          </div>
        </div>
      </div>
    );
  }
}

export default AdminApp;
