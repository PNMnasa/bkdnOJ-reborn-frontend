import React from "react";
import ReactPaginate from "react-paginate";
import { Link } from "react-router";
import { Table } from "react-bootstrap";

import { SpinLoader, ErrorBox } from "components";

import problemApi from "api/problem";
import contestApi from "api/contest";

import { setTitle } from "helpers/setTitle";
import { withParams } from "helpers/react-router";

import ContestContext from "context/ContestContext";

import "styles/ClassicPagination.scss";

interface ProblemListItemProps {
  shortname: string;
  title: string;
  solved_count: number;
  attempted_count: number;
  points: number;
  contest?: boolean;
  label?: string;
  rowid?: number;
  [key: string]: unknown;
}

class ProblemListItem extends React.Component<ProblemListItemProps> {
  render() {
    const { shortname, title, solved_count, attempted_count, points } = this.props;
    const { contest, label } = this.props;

    return (
      <tr>
        {!contest ? (
          <td className="text-truncate problem-code">
            <Link to={`/problem/${shortname}`}>{shortname}</Link>
          </td>
        ) : (
          <td className="text-truncate problem-code">
            <Link to={`${label}`}>{label}</Link>
          </td>
        )}

        {!contest ? (
          <td className="text-truncate problem-title">
            <Link to={`/problem/${shortname}`}>{title}</Link>
          </td>
        ) : (
          <td className="text-truncate problem-title">
            <Link to={`${shortname}`}>{title}</Link>
          </td>
        )}

        <td>{points}</td>
        <td>{solved_count}</td>

        <td>
          {attempted_count === 0
            ? "?"
            : `${((solved_count * 100.0) / attempted_count).toFixed(2)}%`}
        </td>

        <td style={{ width: "20px" }} />
      </tr>
    );
  }
}

interface ProblemListProps {
  params?: Record<string, string | undefined>;
  user?: unknown;
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
    let prms: Record<string, unknown>;
    if (this.state.contest) {
      endpoint = contestApi.getContestProblems as never;
      data = { key: this.state.contest.key };
      prms = { page: params.page + 1, contest: this.state.contest.key };
    } else {
      endpoint = problemApi.getProblems as never;
      data = {};
      prms = { page: params.page + 1 };
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
        console.log(err.response?.data);
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

  handlePageClick = (event: { selected: number }) => {
    this.callApi({ page: event.selected });
  };

  render() {
    const { loaded, errors } = this.state;

    return (
      <div className="problem-table wrapper-vanilla">
        <h4>Problem Set</h4>
        <ErrorBox errors={this.state.errors} />
        <Table responsive hover size="sm" striped bordered className="rounded">
          <thead>
            <tr>
              <th className="problem-code">#</th>
              <th className="problem-title">Title</th>
              <th style={{ width: "12%" }}>Points</th>
              <th style={{ width: "10%" }}>Solved</th>
              <th style={{ width: "10%" }}>AC%</th>
              <th style={{ width: "5%" }}></th>
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
        )}
      </div>
    );
  }
}
ProblemList.contextType = ContestContext;

let Wrapped = ProblemList as React.ComponentType<any>;
Wrapped = withParams(Wrapped);

export default Wrapped;
