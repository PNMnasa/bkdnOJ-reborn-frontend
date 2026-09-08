import React from "react";
import { connect } from "react-redux";

import ReactPaginate from "react-paginate";

import { Link } from "react-router";
import { Table, Button } from "react-bootstrap";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

import { SpinLoader, ErrorBox } from "components";

import problemApi from "api/problem";
import contestApi from "api/contest";

import { setTitle } from "helpers/setTitle";
import { withParams } from "helpers/react-router";

import ContestContext from "context/ContestContext";

import { FaGlobe, FaUniversity, FaRegEyeSlash } from "react-icons/fa";
import { ImBook } from "react-icons/im";
import { BsPersonFill } from "react-icons/bs";

import { parseTime, parseMem } from "helpers/textFormatter";

import "./List.css";
import "styles/ClassicPagination.css";

interface ProblemListItemProps {
  solved?: boolean;
  attempted?: number | null;
  shortname: string;
  title: string;
  solved_count: number;
  attempted_count: number;
  points: number;
  partial?: boolean;
  time_limit?: number;
  memory_limit?: number;
  is_public?: boolean;
  is_organization_private?: boolean;
  contest?: boolean;
  label?: string;
  rowid?: number;
  [key: string]: unknown;
}

class ProblemListItem extends React.Component<ProblemListItemProps> {
  render() {
    const {
      solved,
      attempted,
      shortname,
      title,
      solved_count,
      attempted_count,
      points,
      partial,
      time_limit,
      memory_limit,
      is_public,
      is_organization_private,
    } = this.props;
    const { contest, label } = this.props;

    const link = contest ? `${shortname}` : `/problem/${shortname}`;
    const rate =
      attempted_count === 0 ? "?" : `${((solved_count * 100.0) / attempted_count).toFixed(2)}%`;

    const mode = !is_public ? "Private" : is_organization_private ? "Organization" : "Public";

    let msg: string, color: string;
    if (solved) {
      msg = "Solved!";
      color = "green";
    } else if (attempted !== null) {
      msg = `Not solved. Best: ${attempted} pts.`;
      color = "red";
    } else {
      msg = "Unattempted.";
      color = "gray";
    }

    return (
      <tr>
        <td style={{ width: "60px" }}>
          <OverlayTrigger
            placement="bottom"
            overlay={
              <Tooltip>
                <div style={{ fontSize: "14px" }} className="">
                  {msg}
                </div>
              </Tooltip>
            }
          >
            <Button className="btn-svg" variant="light">
              <ImBook size={30} style={{ verticalAlign: "middle", color }} />
            </Button>
          </OverlayTrigger>
        </td>
        <td>
          <div className="d-flex">
            <div className="d-flex title-section" style={{ flexGrow: 1 }}>
              {contest ? (
                <>
                  <div className="problem-code">
                    <Link to={link}>
                      {label ? `${label}. ` : ""}
                      {title}
                    </Link>
                  </div>
                  <div className="problem-title">
                    <span>{`${parseTime(time_limit || 0)} | ${parseMem(memory_limit || 0)}`}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="problem-code">
                    <Link to={link}>{shortname}</Link>
                    <span className="visibility-tag text-secondary">
                      {mode === "Public" && <FaGlobe />}
                      {mode === "Organization" && <FaUniversity />}
                      {mode === "Private" && <FaRegEyeSlash />}
                      <span style={{ fontSize: "12px" }} className="ml-1 d-none d-md-flex">
                        {mode}
                      </span>
                    </span>
                  </div>
                  <div className="problem-title">
                    <Link to={link}>{title}</Link>
                  </div>
                </>
              )}
            </div>

            <div className="solve-section text-right">
              <div className="flex-center ac-count">
                {`AC: ${solved_count}`}
                <BsPersonFill />
              </div>
              <div className="ac-rate">{rate}</div>
            </div>
          </div>
        </td>

        <td>
          <span className="mr-1">{points}</span>
          <span>{partial ? "" : "(icpc)"}</span>
        </td>
      </tr>
    );
  }
}

interface ProblemListProps {
  selectedOrg: { slug?: string | null };
  user?: unknown;
  params?: Record<string, string | undefined>;
}

interface ProblemListState {
  problems: unknown[];
  count: number;
  currPage: number;
  pageCount: number;
  loaded: boolean;
  errors: unknown;
  contest?: Record<string, unknown>;
}

class ProblemList extends React.Component<ProblemListProps, ProblemListState> {
  static contextType = ContestContext;
  context: Record<string, unknown> = {};

  constructor(props: ProblemListProps) {
    super(props);
    this.state = {
      problems: [],
      count: 0,
      currPage: 0,
      pageCount: 1,
      loaded: false,
      errors: null,
    };
    setTitle("Problems");
  }

  callApi(params = { page: 0 }) {
    this.setState({ loaded: false, errors: null });

    let endpoint: (args: Record<string, unknown>) => Promise<{ data: { results: unknown[]; count: number; total_pages: number } }>;
    let data: Record<string, unknown>;
    let prms: Record<string, unknown> = {};

    if (this.state.contest) {
      endpoint = contestApi.getContestProblems as never;
      data = { key: this.state.contest.key };
      prms = { page: params.page + 1, contest: this.state.contest.key, ...prms };
    } else {
      endpoint = problemApi.getProblems as never;
      data = {};
      prms = { page: params.page + 1, ...prms };
      if (this.props.selectedOrg.slug) {
        prms.org = this.props.selectedOrg.slug;
      }
    }

    endpoint({ ...data, params: prms })
      .then((res) => {
        this.setState({
          problems: res.data.results,
          count: res.data.count,
          pageCount: res.data.total_pages,
          currPage: params.page,
          loaded: true,
        });
      })
      .catch((err: { response?: { data: unknown } }) => {
        this.setState({
          loaded: true,
          errors: err.response?.data || "Cannot fetch problems at the moment.",
        });
      });
  }

  componentDidMount() {
    const contest = this.context.contest as Record<string, unknown> | undefined;
    if (contest) {
      setTitle(`${String((contest as { name?: string }).name)} | Problems`);
      this.setState({ contest }, () => this.callApi({ page: this.state.currPage }));
    } else this.callApi({ page: this.state.currPage });
  }

  componentDidUpdate(prevProps: ProblemListProps, _prevState: ProblemListState) {
    if (prevProps.selectedOrg !== this.props.selectedOrg) {
      this.callApi();
    }
  }

  handlePageClick = (event: { selected: number }) => {
    this.callApi({ page: event.selected });
  };

  render() {
    const { loaded, errors, count } = this.state;

    return (
      <div className="problem-table wrapper-vanilla">
        <div className="problem-count-text">
          <span className="count-text">
            <span className="number">{count || "?"}</span> problem(s)
          </span>
        </div>
        <h4 className="d-flex justify-content-center align-items-center ">Problem Set</h4>

        <ErrorBox errors={this.state.errors} />
        <Table responsive hover size="sm" striped bordered className="rounded">
          <thead>
            <tr>
              <th></th>
              <th>Problem</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {!loaded && (
              <tr>
                <td colSpan={6}>
                  <SpinLoader margin="10px" />
                </td>
              </tr>
            )}
            {loaded && !errors && (
              <>
                {this.state.count > 0 && (
                  <>
                    {this.state.problems.map((prob, idx) => (
                      <ProblemListItem
                        key={`prob-${(prob as { shortname: string }).shortname}`}
                        rowid={idx}
                        {...(prob as ProblemListItemProps)}
                      />
                    ))}
                  </>
                )}

                {this.state.count === 0 && (
                  <>
                    <tr>
                      <td colSpan={6}>
                        <em>No problem is available yet.</em>
                      </td>
                    </tr>
                  </>
                )}
              </>
            )}
          </tbody>
        </Table>
        {this.state.loaded === false ? (
          <SpinLoader margin="0" />
        ) : (
          <>
            <span className="classic-pagination">
              Page:{" "}
              <ReactPaginate
                breakLabel="..."
                onPageChange={this.handlePageClick}
                forcePage={this.state.currPage}
                pageLabelBuilder={(page) => `[${page}]`}
                pageRangeDisplayed={5}
                pageCount={this.state.pageCount}
                renderOnZeroPageCount={null}
                previousLabel={null}
                nextLabel={null}
              />
            </span>
          </>
        )}
      </div>
    );
  }
}

let Wrapped = ProblemList as React.ComponentType<any>;
Wrapped = withParams(Wrapped);
const mapStateToProps = (state: { user: { user: unknown }; myOrg: { selectedOrg: { slug?: string | null } } }) => {
  return {
    user: state.user.user,
    selectedOrg: state.myOrg.selectedOrg,
  };
};
Wrapped = connect(mapStateToProps, null)(Wrapped) as React.ComponentType<any>;
export default Wrapped;
