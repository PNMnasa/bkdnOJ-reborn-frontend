import React from "react";
import { Container } from "components/bootstrap";
import { Outlet } from "react-router";

import { Header, Navbar, Footer, ScrollToTopBtn } from "components";
import SubHeaderRaw from "components/SubHeader/SubHeader";

const SubHeader = SubHeaderRaw as React.ComponentType<any>;

import "./UserApp.css";

interface UserAppProps {
  [key: string]: unknown;
}

export default class UserApp extends React.Component<UserAppProps> {
  render() {
    return (
      <>
        <Header />
        <Navbar />
        <SubHeader />

        <div className="content-wrapper">
          <Container className="content">
            <Outlet />
          </Container>
        </div>

        <div className="footer-wrapper">
          <Footer />
        </div>
        <ScrollToTopBtn />
      </>
    );
  }
}