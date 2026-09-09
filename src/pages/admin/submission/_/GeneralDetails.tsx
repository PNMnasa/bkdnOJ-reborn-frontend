import React from "react";
import {Form, Row, Col} from "components/bootstrap";

export interface SubmissionData {
  id: number | string;
  problem: {
    shortname: string;
    [key: string]: unknown;
  };
  contest_object: string | null;
  user: string;
  judged_date?: string;
  rejudged_date?: string;
  judged_on?: { name: string } | null;
  locked_after?: string;
  language: string;
  source: string;
  [key: string]: unknown;
}

interface GeneralDetailsProps {
  id: string;
  data: SubmissionData | undefined;
}

interface GeneralDetailsState {
  id: string;
  data?: Record<string, unknown>;
}

export default class GeneralDetails extends React.Component<GeneralDetailsProps, GeneralDetailsState> {
  constructor(props: GeneralDetailsProps) {
    super(props);
    this.state = {
      id: this.props.id,
    };
  }

  inputChangeHandler(event: React.ChangeEvent<HTMLInputElement>, params = {isCheckbox: false}) {
    const isCheckbox = params.isCheckbox || false;

    let newData = this.state.data!;
    if (!isCheckbox) newData[event.target.id] = event.target.value;
    else {
      newData[event.target.id] = !newData[event.target.id];
    }
    this.setState({data: newData});
  }

  formSubmitHandler(e: React.FormEvent) {
    e.preventDefault();
  }

  render() {
    const {data} = this.props;
    if (!data) {
      return <span className="loading_3dot">Loading</span>;
    }

    return (
      <Form id="submission-general" onSubmit={e => this.formSubmitHandler(e)}>
        <Row>
          <Form.Label column="sm" sm={3}>
            {" "}
            ID{" "}
          </Form.Label>
          <Col>
            {" "}
            <Form.Control
              size="sm"
              type="text"
              placeholder="submission id"
              id="ID"
              value={data.id}
              disabled
              readOnly
            />
          </Col>
        </Row>
        <Row>
          <Form.Label column="sm" sm={3}>
            {" "}
            Problem{" "}
          </Form.Label>
          <Col>
            {" "}
            <Form.Control
              size="sm"
              type="text"
              placeholder="Problem Code"
              id="problem"
              value={data.problem.shortname}
              disabled
              readOnly
            />
          </Col>
        </Row>
        <Row>
          <Form.Label column="sm" sm={3}>
            {" "}
            Contest{" "}
          </Form.Label>
          <Col>
            {" "}
            <Form.Control
              size="sm"
              type="text"
              placeholder="Contest key"
              id="contest"
              value={data.contest_object ? data.contest_object : "None"}
              disabled
              readOnly
            />
          </Col>
        </Row>

        <Row>
          <Form.Label column="sm" sm={3}>
            {" "}
            Author{" "}
          </Form.Label>
          <Col>
            <Form.Control
              size="sm"
              type="text"
              id="author"
              value={data.user}
              readOnly
            />
          </Col>
        </Row>

        <Row>
          <Form.Label column="sm" sm={3}>
            {" "}
            Judged Date{" "}
          </Form.Label>
          <Col>
            <Form.Control
              size="sm"
              type="text"
              id="judged_date"
              value={data.judged_date || "N/A"}
              readOnly
            />
          </Col>
        </Row>
        <Row>
          <Form.Label column="sm" sm={3}>
            {" "}
            Re-judged Date{" "}
          </Form.Label>
          <Col>
            <Form.Control
              size="sm"
              type="text"
              id="rejudged_date"
              value={data.rejudged_date || "N/A"}
              readOnly
            />
          </Col>
        </Row>
        <Row>
          <Form.Label column="sm" sm={3}>
            {" "}
            Judged On{" "}
          </Form.Label>
          <Col>
            <Form.Control
              size="sm"
              type="text"
              id="judged_on"
              value={data.judged_on ? (data.judged_on as { name: string }).name : "N/A"}
              readOnly
            />
          </Col>
        </Row>
        <Row>
          <Form.Label column="sm" sm={3}>
            {" "}
            Locked After{" "}
          </Form.Label>
          <Col>
            <Form.Control
              size="sm"
              type="text"
              id="locked_after"
              value={data.locked_after || "N/A"}
              readOnly
            />
          </Col>
        </Row>

        <Row>
          <Form.Label column="sm" sm={3}>
            {" "}
            Language{" "}
          </Form.Label>
          <Col>
            {" "}
            <Form.Control
              size="sm"
              type="text"
              placeholder="language"
              id="language"
              value={data.language}
              disabled
              readOnly
            />
          </Col>
        </Row>

        <Row>
          <Form.Label column="sm" lg={3}>
            {" "}
            Source{" "}
          </Form.Label>
          <Col>
            <Form.Control
              as="textarea"
              id="source"
              defaultValue={data.source}
              disabled
              readOnly
            />
          </Col>
        </Row>

        <hr className="m-2" />

        <Row>
          <Col lg={10}>
            <sub>**Chưa thể chỉnh sửa.</sub>
          </Col>
          <Col>
          </Col>
        </Row>
      </Form>
    );
  }
}
