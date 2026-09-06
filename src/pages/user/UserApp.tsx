import React from "react";
import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";

import { Header, Navbar, SubHeader, Footer, ScrollToTopBtn } from "components";

import "./UserApp.scss";

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