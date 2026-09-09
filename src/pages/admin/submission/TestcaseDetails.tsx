import React from "react";
import {Form, Accordion, Table, Row, Col} from "components/bootstrap";
import {ErrorBox, SpinLoader} from "components";

interface ButtonPanelProps {}

class ButtonPanel extends React.Component<ButtonPanelProps> {
  render() {
    return (
      <Row className="button-panel">
        <Col lg={10}>
          <sub>**Chưa thể chỉnh sửa.</sub>
        </Col>
        <Col>
        </Col>
      </Row>
    );
  }
}

interface TestcaseItemProps {
  id: number | string;
  status: string;
  time: string;
  memory: string;
  points: number | string;
  total: number | string;
  case: number | string;
  rowidx?: number;
  [key: string]: unknown;
}

class TestcaseItem extends React.Component<TestcaseItemProps> {
  render() {
    const {id, status, time, memory, points, total} = this.props;
    const case_no = this.props.case;

    return (
      <tr>
        <td>{id}</td>
        <td>{case_no}</td>
        <td>{status}</td>
        <td>{time}</td>
        <td>{memory}</td>
        <td>{points}</td>
        <td>{total}</td>
      </tr>
    );
  }
}

interface SubmissionData {
  result?: string;
  status?: string;
  error?: string;
  points?: number | string;
  test_cases?: TestcaseItemProps[];
  [key: string]: unknown;
}

interface TestcaseDetailsProps {
  shortname?: string;
  id: string;
  data: SubmissionData | undefined;
}

interface TestcaseDetailsState {
  shortname?: string;
  data: null;
  loaded: boolean;
  errors: unknown;
}

export default class TestcaseDetails extends React.Component<TestcaseDetailsProps, TestcaseDetailsState> {
  constructor(props: TestcaseDetailsProps) {
    super(props);
    this.state = {
      shortname: this.props.shortname,
      data: null,
      loaded: false,
      errors: null,
    };
  }

  render() {
    const {data} = this.props;
    if (!data)
      return (
        <div className="center">
          <SpinLoader margin="10px" />
        </div>
      );

    const testcases = data.test_cases || [];

    return (
      <Form id="submissison-testcase-form">
        <ErrorBox errors={this.state.errors} />
        <Accordion defaultActiveKey="0">
          <Accordion.Item eventKey="0" className="overall">
            <Accordion.Header>Verdict</Accordion.Header>
            <Accordion.Body>
              <Row>
                <Form.Label column="sm" lg={3}>
                  {" "}
                  Result{" "}
                </Form.Label>
                <Col>
                  <Form.Control
                    type="text"
                    size="sm"
                    id="source"
                    defaultValue={data.result}
                    disabled
                    readOnly
                  />
                </Col>
              </Row>
              <Row>
                <Form.Label column="sm" lg={3}>
                  {" "}
                  Status{" "}
                </Form.Label>
                <Col>
                  <Form.Control
                    type="text"
                    size="sm"
                    id="status"
                    defaultValue={data.status}
                    disabled
                    readOnly
                  />
                </Col>
              </Row>
              <Row>
                <Form.Label column="sm" lg={3}>
                  {" "}
                  Error{" "}
                </Form.Label>
                <Col>
                  <Form.Control
                    as="textarea"
                    size="sm"
                    id="error"
                    defaultValue={data.error}
                    disabled
                    readOnly
                  />
                </Col>
              </Row>
              <Row>
                <Form.Label column="sm" lg={3}>
                  {" "}
                  Points{" "}
                </Form.Label>
                <Col>
                  <Form.Control
                    type="text"
                    size="sm"
                    id="points"
                    defaultValue={data.points}
                    disabled
                    readOnly
                  />
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="1" className="cases">
            <Accordion.Header>Case Results</Accordion.Header>
            <Accordion.Body>
              <Table
                responsive
                hover
                size="sm"
                striped
                bordered
                className="rounded text-center"
              >
                <thead>
                  <tr>
                    <th style={{width: "5%"}}>#</th>
                    <th style={{width: "10%"}}>Case</th>
                    <th style={{width: "15%"}}>Result</th>
                    <th style={{width: "15%"}}>Time</th>
                    <th style={{width: "15%"}}>Memory</th>
                    <th style={{width: "10%"}}>Points</th>
                    <th style={{width: "10%"}}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {testcases.map((tc, idx) => (
                    <TestcaseItem key={`tc-${tc.id}`} rowidx={idx} {...tc} />
                  ))}
                </tbody>
              </Table>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        <hr className="m-2" />

        <ButtonPanel />
      </Form>
    );
  }
}
