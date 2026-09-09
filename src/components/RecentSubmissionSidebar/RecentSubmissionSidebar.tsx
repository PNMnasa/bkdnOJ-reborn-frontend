import React from "react";

import { connect } from "react-redux";
import type { AnyAction } from "redux";
import ReactPaginate from "react-paginate";
import { stopPolling } from "redux/RecentSubmission";

import { Table } from "components/bootstrap";
import { Link } from "react-router";

import contestAPI from "api/contest";

import { ErrorBox, SpinLoader } from "components";
import ContestContext from "context/ContestContext";

import { getHourMinuteSecond, getYearMonthDate } from "helpers/dateFormatter";
import { shouldStopPolling } from "constants/statusFilter";

import "./RecentSubmissionSidebar.css";

const __RECENT_SUBMISSION_POLL_DELAY = 3000; // ms
const __RECENT_SUBMISSION_MAX_POLL_DURATION = 30 * 1000; // ms

interface RSubItemProps {
  id: number;
  ckey: string;
  problem: { shortname: string };
  language: string;
  points: number | null;
  status: string;
  result: string | null;
  date: string;
}

class RSubItem extends React.Component<RSubItemProps> {
  parseTime(time: number) {
    if (time === 0) return "0 ms";
    if (!time) return "N/A";
    return `${(time * 1000).toFixed(0)} ms`;
  }
  parseMemory(mem: number) {
    if (mem === 0) return "0 KB";
    if (!mem) return "N/A";
    if (mem > 65535) return `${(mem + 1023) / 1024} MB`;
    return `${mem} KB`;
  }

  render() {
    const { id, ckey, problem, language, points, status, result, date } = this.props;
    const verdict = status === "D" ? (result ?? "") : status;

    return (
      <tr>
        <td className="info">
          <div className="info-wrapper">
            <div className="flex-center-col">
              <div className="prob-wrapper">
                <Link id="sub-id" to={`/contest/${ckey}/submission/${id}`}>
                  #{id}
                </Link>
                -
                <Link className="prob text-truncate-rv" to={`/contest/${ckey}/problem/${problem.shortname}`}>
                  {problem.shortname}
                </Link>
              </div>

              <div className="other-wrapper">
                <span className="lang-wrapper">{language}</span>|
                <span className={`text-wrapper verdict ${verdict.toLowerCase()}`}>{verdict}</span>
                {typeof points === "number" ? (
                  <>
                    |
                    <span className={`points verdict ${verdict.toLowerCase()} text-truncate`}>
                      {`${points} pts`}
                    </span>
                  </>
                ) : (
                  "n/a"
                )}
              </div>
            </div>
          </div>
        </td>

        <td className="flex-center responsive-date">
          <div className="date">{getYearMonthDate(date)}</div>
          <div className="time">{getHourMinuteSecond(date)}</div>
        </td>
      </tr>
    );
  }
}

interface SubmissionShape {
  id: number;
  status: string;
  [key: string]: unknown;
}

interface RecentSubmissionSidebarProps {
  user: AuthUser | null;
  profile: unknown;
  polling: number;
  stopPolling: () => void;
}

interface AuthUser {
  username: string;
  [key: string]: unknown;
}

interface RecentSubmissionSidebarState {
  subs: SubmissionShape[];
  loaded: boolean;
  errors: Record<string, unknown> | null;
  count: number | null;
  pageCount?: number;

  contest: { key: string } | null;
  user: AuthUser | null;
  currPage: number;

  isPollingOn: boolean;
  isPolling: boolean;
}

class RecentSubmissionSidebar extends React.Component<
  RecentSubmissionSidebarProps,
  RecentSubmissionSidebarState
> {
  static contextType = ContestContext;
  context!: React.ContextType<typeof ContestContext>;

  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(props: RecentSubmissionSidebarProps) {
    super(props);
    this.state = {
      subs: [],
      loaded: false,
      errors: null,
      count: null,

      contest: null,
      user: null,
      currPage: 0,

      isPollingOn: true,
      isPolling: false,
    };
  }

  refetch(poll = false) {
    if (poll) this.setState({ isPolling: true, errors: null });
    else this.setState({ loaded: false, count: null, errors: null });

    const pageNo = { page: this.state.currPage + 1 };

    const { user } = this.state;
    if (!this.state.contest) return;
    contestAPI
      .getContestSubmissions({
        key: this.state.contest.key,
        params: { user: user?.username, ...pageNo },
      })
      .then((res) => {
        this.setState({
          isPolling: false,
          loaded: true,
          subs: res.data.results,
          count: res.data.count,
          pageCount: res.data.total_pages,
        });
      })
      .catch((err: { response?: { data?: unknown } }) => {
        this.setState({
          isPolling: false,
          loaded: true,
          errors: (err.response?.data as Record<string, unknown>) || null,
          count: 0,
        });
      });
  }

  handlePageClick = (event: { selected: number }) => {
    this.setState({ currPage: event.selected }, () => this.refetch());
  };

  pollResult() {
    if (this.state.subs[0] && shouldStopPolling(this.state.subs[0].status)) {
      if (this.timer) clearInterval(this.timer);
      return;
    }
    if (this.state.errors) {
      if (this.timer) clearInterval(this.timer);
      return;
    }
    this.refetch(true);
  }

  componentDidMount() {
    this.setState({
      contest: (this.context.contest as { key: string } | undefined) || null,
      user: (this.props && this.props.user) || null,
    });
  }

  componentDidUpdate(
    prevProps: RecentSubmissionSidebarProps,
    prevState: RecentSubmissionSidebarState
  ) {
    const { user } = this.props;
    const { contest } = this.context;
    if (!user || !contest) return;
    if (
      !prevState.contest ||
      !prevState.user ||
      (prevState.contest as { key: string }).key !== (contest as { key: string }).key ||
      prevState.user.username !== user.username
    ) {
      this.setState({ user, contest: contest as { key: string } }, () => {
        this.refetch();
      });
    }

    if (prevProps.polling !== this.props.polling) {
      if (this.timer) clearInterval(this.timer);
      if (this.props.polling) {
        this.refetch(true);
        this.timer = setInterval(() => this.pollResult(), __RECENT_SUBMISSION_POLL_DELAY);
        setTimeout(() => this.props.stopPolling(), __RECENT_SUBMISSION_MAX_POLL_DURATION);
      }
    }
  }

  componentWillUnmount() {
    if (this.timer) clearInterval(this.timer);
  }

  render() {
    const { subs, loaded, errors, user, contest } = this.state;

    return (
      <div className="wrapper-vanilla" id="recent-submission-sidebar">
        <h4>Recent Submission</h4>
        {!user && (
          <span>
            <Link to="/sign-in">Log in</Link> to see
          </span>
        )}
        {!!user && !contest && <span>Contest is not available.</span>}
        {!!user && !!contest && !loaded && <SpinLoader margin="20px" />}
        {!!user && !!contest && !!loaded && (
          <>
            <div className="pl-1 pr-1">
              <ErrorBox errors={errors as never} />
            </div>

            <Table responsive hover size="sm" striped bordered className="rounded">
              <thead>
                <tr>
                  <th className="subid">Info</th>
                  <th className="responsive-date">When</th>
                </tr>
              </thead>
              <tbody>
                {loaded && !errors && (
                  <>
                    {this.state.count === 0 ? (
                      <tr>
                        <td colSpan={4}>
                          <em>No Submissions Yet.</em>
                        </td>
                      </tr>
                    ) : (
                      subs.map((sub, idx) => (
                        <RSubItem
                          key={`recent-sub-${sub.id}`}
                          {...(sub as unknown as RSubItemProps)}
                          ckey={this.state.contest ? this.state.contest.key : ""}
                        />
                      ))
                    )}
                  </>
                )}
              </tbody>
            </Table>

            {!!user && !!contest && this.state.loaded === false ? (
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
                  pageCount={this.state.pageCount ?? 0}
                  renderOnZeroPageCount={null}
                  previousLabel={null}
                  nextLabel={null}
                />
              </span>
            )}
          </>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: {
  user: { user: AuthUser | null };
  profile: { profile: unknown };
  recentSubmission: { polling: number };
}) => {
  return {
    user: state.user.user,
    profile: state.profile.profile,
    polling: state.recentSubmission.polling,
  };
};

const mapDispatchToProps = (dispatch: (action: AnyAction) => void) => {
  return {
    stopPolling: () => dispatch(stopPolling()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(RecentSubmissionSidebar) as React.ComponentType<any>;