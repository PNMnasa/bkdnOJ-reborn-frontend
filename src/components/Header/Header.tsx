import React from "react";
import { Link } from "react-router";

import { Modal, Button, Container } from "react-bootstrap";
import { VscBug } from "components/icons";


import flag from "assets/images/bkdnoj-dropflag.png";
import "./Header.css";

interface HeaderState {
  show: boolean;
}

export default class Header extends React.Component<{}, HeaderState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      show: false,
    };
  }
  handleClose() {
    this.setState({ show: false });
  }
  handleOpen() {
    this.setState({ show: true });
  }

  render() {
    const github = "https://github.com/BKDN-University/bkdnOJ-v2";

    return (
      <div className="header">
        <Container>
          <div className="site-logo d-none d-md-block">
            <Link to="/">
              <img src={flag} alt="Drop down Flag with BKDN icon and Online Judge text" />
            </Link>
          </div>
          <span>bkdnOJ v2.0</span>
          <span>open-Beta</span>
          <span className="bugs" onClick={() => this.handleOpen()}>
            Bugs 🐞
          </span>
        </Container>

        <Modal
          show={this.state.show}
          onHide={() => this.handleClose()}
          centered
        >
          <Modal.Header>
            <Modal.Title className="flex-center">
              <VscBug /> Bugs Season <VscBug />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            🐞 Đây là phiên bản beta của bkdnOJ v2.0 vẫn trong quá trình phát triển nên chắc chắn sẽ tồn tại bugs nhiều hình thái, đôi khi rất quái gở. Mong nhận được sự thông cảm của mọi người.
            <br /> <br />
            🐞 Để báo cáo bugs, tạo <strong>New Issue</strong> tại <a href={github}>Github này</a> và đính kèm ảnh/video bug, mô tả bug, nêu những bước để tái hiện bug đó. Xin cảm ơn các bạn đã chung tay giúp cho bkdnOJ-v2 hoàn thiện hơn.
            <br />
            <sub style={{ float: "right" }}>🐞🐞🐞</sub>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => this.handleClose()}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}