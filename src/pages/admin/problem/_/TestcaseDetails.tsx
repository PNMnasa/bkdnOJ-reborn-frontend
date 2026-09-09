import React from "react";
import {Link} from "react-router";
import {Form, Accordion, Button, Table, Row, Col} from "components/bootstrap";
import {ErrorBox, SpinLoader} from "components";
import { VscRefresh } from "components/icons";


import problemAPI from "api/problem";

interface TestcaseItemData {
  id: number;
  order?: number;
  input_file: string;
  output_file: string;
  points: number;
  is_pretest: boolean;
  [key: string]: unknown;
}

interface TestcaseItemProps extends TestcaseItemData {
  rowidx?: number;
  onPretestToggle: () => void;
  isSelected: boolean;
  onSelectChkChange: () => void;
}

class TestcaseItem extends React.Component<TestcaseItemProps> {
  render() {
    const {
      order,
      input_file,
      output_file,
      points,
      is_pretest,
      onPretestToggle,
      isSelected,
      onSelectChkChange,
    } = this.props;

    return (
      <tr>
        <td>{order}</td>
        <td>{input_file}</td>
        <td>{output_file}</td>
        <td>{points}</td>
        <td>
          <input
            type="checkbox"
            value={is_pretest as unknown as string}
            onChange={() => onPretestToggle()}
          />
        </td>
        <td>
          <input
            type="checkbox"
            value={isSelected as unknown as string}
            onChange={() => onSelectChkChange()}
          />
        </td>
      </tr>
    );
  }
}

interface TestcaseDetailsProps {
  shortname: string;
  setErrors?: (e: unknown) => void;
  forceRerender: () => void;
}

interface TestcaseDetailsState {
  data: TestcaseItemData[];
  loaded: boolean;
  errors: unknown;
  selectChk: boolean[];
  submitting: boolean;
}

export default class TestcaseDetails extends React.Component<TestcaseDetailsProps, TestcaseDetailsState> {
  constructor(props: TestcaseDetailsProps) {
    super(props);
    this.state = {
      data: [],
      loaded: false,
      errors: null,

      selectChk: [],
      submitting: false,
    };
  }

  selectChkChangeHandler(idx: number) {
    const {selectChk} = this.state;
    if (idx >= selectChk.length) console.log("Invalid delete tick position");
    else {
      const val = selectChk[idx];
      this.setState({
        selectChk: selectChk
          .slice(0, idx)
          .concat(!val, selectChk.slice(idx + 1)),
      });
    }
  }

  pretestToggleHandler(id: number) {
    const testcases = this.state.data;
    let sel = testcases.find(tc => tc.id === id);
    if (!sel) return;
    sel.is_pretest = !sel.is_pretest;

    this.setState({
      data: testcases.map(tc => (tc.id === id ? sel : tc)),
    });
  }

  refetch() {
    if (this.state.submitting) return;
    if (this.props.setErrors) {
      this.props.setErrors(null);
    }
    this.setState(
      {
        submitting: true,
        errors: null,
      },
      () => {
        const {shortname} = this.props;
        problemAPI
          .adminGetProblemDetailsTest({shortname})
          .then(res => {
            this.setState({
              data: res.data,
              selectChk: Array(res.data.length).fill(false),
              loaded: true,
              submitting: false,
            });
          })
          .catch((err: { response?: { data: unknown } }) => {
            this.setState({
              loaded: true,
              submitting: false,
            });
            if (this.props.setErrors) {
              this.props.setErrors({errors: err.response?.data});
            }
          });
      }
    );
  }

  componentDidMount() {
    this.refetch();
  }

  formSubmitHandler(e: React.FormEvent) {
    e.preventDefault();
    this.props.forceRerender();
    alert("Editing this resource is not implemented.");
  }

  render() {
    const {data, loaded} = this.state;
    const testcases = data;

    return (
      <Form
        id="problem-testcase-form"
        onSubmit={e => this.formSubmitHandler(e)}
      >
        <Row className="options m-1 border">
          <Col>
            {this.state.submitting && (
              <span className="loading_3dot">Đang xử lý yêu cầu</span>
            )}
          </Col>
          <Button
            variant="dark"
            size="sm"
            className="btn-svg"
            onClick={() => this.refetch()}
          >
            <VscRefresh /> Refresh
          </Button>
        </Row>

        <Accordion defaultActiveKey="0">
          <Accordion.Item eventKey="0" className="testcases">
            <Accordion.Header>Testcases</Accordion.Header>
            <Accordion.Body>
              <ErrorBox errors={this.state.errors} />
              <sub className="ml-2">
                Những testcase này được tự động tạo ra từ file nén Archive trong
                tab Test Data.
              </sub>
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
                    <th style={{width: "12%"}}>Input File</th>
                    <th style={{width: "10%"}}>Output File</th>
                    <th style={{width: "13%"}}>Trọng số</th>
                    <th style={{width: "10%"}}>Pretest?</th>
                    <th style={{width: "8%"}}>
                      <Link to="#" onClick={() => alert("Not implemented.")}>
                        Action
                      </Link>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loaded === false ? (
                    <tr>
                      <td colSpan={6}>
                        <SpinLoader margin="10px" />
                      </td>
                    </tr>
                  ) : (
                    testcases.map((tc, idx) => (
                      <TestcaseItem
                        key={`tc-${tc.id}`}
                        rowidx={idx}
                        {...tc}
                        onPretestToggle={() => this.pretestToggleHandler(tc.id)}
                        isSelected={this.state.selectChk[idx]}
                        onSelectChkChange={() =>
                          this.selectChkChangeHandler(idx)
                        }
                      />
                    ))
                  )}
                </tbody>
              </Table>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        <Row>
          <Col>
            <Button
              variant="dark"
              size="sm"
              type="submit"
              onClick={e => this.formSubmitHandler(e)}
            >
              No Op
            </Button>
            {this.state.submitting && (
              <SpinLoader size={20} margin="auto 0 auto 15px" />
            )}
          </Col>
        </Row>
      </Form>
    );
  }
}
