import React from "react";
import { Row, Col, Button } from "components/bootstrap";
import { BiArrowFromLeft, BiArrowFromRight } from "components/icons";

import type { ReactNode } from "react";

import "./ListSidebar.css";
import OutsideAlerter from "helpers/OutsiderAlerter";

interface OffcanvasProps {
  sideComponents: ReactNode[];
  closeCanvas: () => void;
}

class Offcanvas extends React.Component<OffcanvasProps> {
  render() {
    const sideComponents = this.props.sideComponents;

    return (
      <div id="offcanvas" className="offcanvas">
        {sideComponents.map((comp, indx) => (
          <div key={`side-component-${indx}`} className="side-component rounded">
            {comp}
          </div>
        ))}

        <div className="offcanvasCloseBtn-wrapper">
          <Button
            id="offcanvasCloseBtn"
            className="offcanvasCloseBtn btn-dark hidden"
            onClick={() => this.props.closeCanvas()}
          >
            <BiArrowFromLeft />
          </Button>
        </div>
      </div>
    );
  }
}

/*
 * A better name would be 8-4 layout. This layout will display
   main content by 8 | side content 4 on wide screen. On mobile,
   side content will be put onto an off-canvas, that can be accessed
   by a fixed button on the bottom
 * params:
     - mainContent: a React Component, will appear in the main content section
     - sideComponents: a list of React Components, appear on the side or off-canvas
 */
interface ListSidebarProps {
  mainContent?: ReactNode;
  sideComponents?: ReactNode[];
}

export default class ListSidebar extends React.Component<ListSidebarProps> {
  state = {
    offcanvasShow: false,
  };

  render() {
    const mainContent = this.props.mainContent || <p>This is main content</p>;
    const sideComponents = this.props.sideComponents || [];

    return (
      <div className="list-sidebar-wrapper">
        <Row>
          <div className="d-block d-lg-none">
            <OutsideAlerter
              isDetecting={this.state.offcanvasShow}
              outsideClickHandler={() => this.close()}
            >
              <Offcanvas closeCanvas={() => this.close()} sideComponents={sideComponents} />
            </OutsideAlerter>
          </div>

          <Col lg={8}>
            <div className="offcanvas-menu" id="offcanvas-menu">
              {mainContent}

              <div className="offcanvasOpenBtn-wrapper">
                <Button
                  className="offcanvasOpenBtn btn-dark d-block d-lg-none"
                  onClick={() => this.toggle()}
                >
                  <BiArrowFromRight />
                </Button>
              </div>
            </div>
          </Col>

          <Col lg={4} className="side-bar center d-none d-lg-flex">
            {sideComponents.map((comp, indx) => (
              <div key={`side-component-${indx}`} className="mb-2">
                <div className="side-component">{comp}</div>
              </div>
            ))}
          </Col>
        </Row>
      </div>
    );
  }

  toggle() {
    const bool = this.state.offcanvasShow;
    if (bool) this.close();
    else this.open();
  }

  open() {
    this.setState({ offcanvasShow: true }, () => {
      const sidenav = document.getElementById("offcanvas");
      if (sidenav) sidenav.style.width = "350px";
    });
  }
  close() {
    this.setState({ offcanvasShow: false }, () => {
      const sidenav = document.getElementById("offcanvas");
      if (sidenav) sidenav.style.width = "0";
    });
  }
}