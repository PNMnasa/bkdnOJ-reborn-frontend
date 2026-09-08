import React from "react";
import { setTitle } from "helpers/setTitle";

import { Row, Col } from "react-bootstrap";

import UniIcon from "assets/images/bkdn-uni-icon-white.png";

import "./Content.scss";

export default class Content extends React.Component {
  constructor(props: {}) {
    super(props);
    setTitle();
  }

  render() {
    return (
      <div className="content-div shadow rounded">
        <Row className="pl-3 pr-3">
          <Col md={4} className="d-flex flex-column justify-content-center align-items-center">
            <img
              className="img-fluid"
              src={UniIcon}
              alt="bkdnoj-logo"
              style={{ maxWidth: "90%" }}
            />
          </Col>
          <Col md={8}>
            <div
              style={{ height: "100%" }}
              className="d-flex flex-column justify-content-center align-items-center"
            >
              <span className="subtext">Welcome to</span>
              <div className="big-title pt-2 pb-2">
                <h4 className="">Bách Khoa Đà Nẵng Online Judge 2.0</h4>
                <div className="title">
                  <h5 className="">
                    phase <span className="code-markup">openBETA</span>
                  </h5>
                  <span className="code-markup">22年10月20日</span>
                </div>
              </div>
              <span className="subtext text-center">
                Your new online platform for practicing and hosting programming contests, for Vietnam Central Province.
              </span>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}