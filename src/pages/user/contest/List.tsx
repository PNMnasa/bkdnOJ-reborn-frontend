import React from "react";
import {toast} from "react-toastify";
import {connect} from "react-redux";

import ReactPaginate from "react-paginate";
import {Link} from "react-router";
import {Table} from "components/bootstrap";
import { VscPerson } from "components/icons";


import {SpinLoader, ErrorBox} from "components";
import contestAPI from "api/contest";
import {setTitle} from "helpers/setTitle";
import {getDuration} from "helpers/durationFormatter";

import "./List.css";
import "styles/ClassicPagination.css";

interface ContestShape {
  key: string;
  name: string;
  start_time: string;
  end_time?: string;
  time_limit?: string;
  user_count?: number;
  spectate_allow?: boolean;
  register_allow?: boolean;
  is_registered?: boolean;
  [key: string]: unknown;
}

interface ProfileShape {
  current_contest?: { contest: { key: string }; virtual: number };
  [key: string]: unknown;
}

interface UserShape {
  username?: string;
  is_staff?: boolean;
  [key: string]: unknown;
}

interface ContestListItemProps {
  data: ContestShape;
  type: string;
  user: UserShape | null;
  profile?: ProfileShape | null;
  refetch?: () => void;
  rowid?: number;
  [key: string]: unknown;
}

interface ContestListItemState {
  time_label: string;
}

class ContestListItem extends React.Component<ContestListItemProps, ContestListItemState> {
  private timer?: ReturnType<typeof setInterval>;

  constructor(props: ContestListItemProps) {
    super(props);
    this.state = {
      time_label: "Loading..",
    };
  }

  updateTimeLeftLabel() {
    const contest = this.props.data;
    let start_time = new Date(contest.start_time);
    let end_time = new Date(contest.end_time || "");
    if (isNaN(start_time.getTime()) || isNaN(end_time.getTime())) {
      clearInterval(this.timer);
      return;
    }

    let now = new Date();
    let lbl = "";
    let t = 0;
    if (now < start_time) {
      lbl = "Contest Starting In ";
      t = Math.floor((start_time.getTime() - now.getTime()) / 1000);
    } else if (now < end_time) {
      lbl = "Contest is Running: ";
      t = Math.floor((end_time.getTime() - now.getTime()) / 1000);
    } else {
      lbl = "Contest is Finished";
      t = 0;
      clearInterval(this.timer);
    }
    this.setState({time_label: lbl});

    let hhmmss = "";
    if (t > 0) {
      let s = t % 60;
      let m = Math.floor(t / 60);
      let h = Math.floor(m / 60);
      m = m % 60;
      hhmmss =
        (h < 10 ? "0" : "") +
        h +
        ":" +
        (m < 10 ? "0" : "") +
        m +
        ":" +
        (s < 10 ? "0" : "") +
        s +
        "";
    }
    this.setState({time_label: `${lbl} ${hhmmss}`});
  }
  componentDidMount() {
    clearInterval(this.timer);
    this.timer = setInterval(() => this.updateTimeLeftLabel(), 1000);
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }

  parseStartTime() {
    if (this.props.data.start_time)
      return (
        <span>
          {new Date(this.props.data.start_time).toLocaleString()}
          <div style={{fontSize: "10px"}}>
            UTC{this.props.data.start_time.substring(19)}
          </div>
        </span>
      );
    return "Chưa công bố";
  }
  parseDuration() {
    if (this.props.data.time_limit) return this.props.data.time_limit;
    return getDuration(this.props.data.start_time, this.props.data.end_time || "");
  }
  parseParticipation() {
    const type = this.props.type;
    if (type === "active") {
      return;
    }
  }

  isInContest(ckey: string) {
    const {profile} = this.props;
    if (!profile || !profile.current_contest) return false;
    if (profile.current_contest.contest.key !== ckey) return false;
    return true;
  }
  isParticipant(ckey: string) {
    if (!this.isInContest(ckey)) return false;
    const {profile} = this.props;
    if (!profile) return false;
    return profile.current_contest!.virtual === 0;
  }
  isSpectator(ckey: string) {
    if (!this.isInContest(ckey)) return false;
    const {profile} = this.props;
    if (!profile) return false;
    return profile.current_contest!.virtual === -1;
  }

  registerContest(ckey: string, ooc?: boolean) {
    let conf = false;
    if (ooc) {
      conf = window.confirm(
        `Đăng ký cuộc thi "${ckey}" ở tư cách spectator? Bạn sẽ có thể nộp bài, nhưng sẽ không xuất hiện trên bảng xếp hạng.`
      );
    } else {
      conf = window.confirm(
        `Đăng ký cuộc thi "${ckey}"? Sau khi đăng ký, bạn có thể nộp bài và xuất hiện trên bảng xếp hạng.`
      );
    }
    if (!conf) return false;

    contestAPI
      .joinContest({key: ckey})
      .then(() => {
        toast.success(`Đăng ký contest ${ckey} thành công.`, {
          toastId: "contest-registered",
        });
      })
      .catch((err: { response?: { data?: { detail?: string } } }) => {
        const msg =
          (err.response && err.response.data && err.response.data.detail) ||
          `Đăng ký contest "${ckey}" thất bại.`;
        toast.error(msg, {toastId: "contest-register-failed"});
      })
      .finally(() => this.props.refetch && this.props.refetch());
  }

  render() {
    const ckey = this.props.data.key;
    const cname = this.props.data.name;
    const {spectate_allow, register_allow, is_registered} = this.props.data;
    const type = this.props.type;
    const {user} = this.props;

    return (
      <tr>
        <td className="text-truncate" style={{maxWidth: "100px"}}>
          <Link to={`/contest/${ckey}`}>{ckey}</Link>
        </td>
        <td
          className=""
          style={{minWidth: "200px", maxWidth: "300px"}}
        >
          <Link to={`/contest/${ckey}`}>{cname}</Link>
          {type !== "past" && (
            <>
              <br />
              <span className="d-inline-flex align-items-center contest-status-lbl">
                {this.state.time_label}
              </span>
            </>
          )}
        </td>
        <td className="contest-start" style={{minWidth: "150px"}}>
          {this.parseStartTime()}
        </td>
        <td>{this.parseDuration()}</td>
        <td className="participate-options">
          {
            <div
              className="text-center d-flex flex-column align-items-center"
              style={{width: "100%"}}
            >
              <div className="flex-center">
                Participants: {this.props.data.user_count}
                <VscPerson size={18} />
              </div>
              {
                /* Active: Present contest that has Live Participation of user */
                type === "active" && (
                  <>
                    {
                      <span className="active-continue-label">
                        <Link to={`/contest/${ckey}`}>{`Continue >>`}</Link>
                      </span>
                    }
                    <span className="d-inline-flex align-items-center">
                      <Link
                        to={`/contest/${ckey}/standing`}
                      >{`Current Standing >>`}</Link>
                    </span>
                  </>
                )
              }

              {
                /* Active: Present contest that doesnt have Live Participation of user */
                (type === "present" || type === "future") && (
                  <>
                    {user && !is_registered && (
                      <>
                        {spectate_allow ? (
                          <span className="d-inline-flex align-items-center">
                            <Link
                              to="#"
                              onClick={() => this.registerContest(ckey, true)}
                            >{`Register (out of competition) >>`}</Link>
                          </span>
                        ) : register_allow ? (
                          <span className="d-inline-flex align-items-center">
                            <Link
                              to="#"
                              onClick={() => this.registerContest(ckey)}
                            >{`Register >>`}</Link>
                          </span>
                        ) : (
                          <span className="d-inline-flex align-items-center">
                            <span style={{color: "red"}}>
                              Register is not Allowed.
                            </span>
                          </span>
                        )}
                      </>
                    )}
                    {user && is_registered && spectate_allow && (
                      <Link to={`/contest/${ckey}`}>{`Spectate >>`}</Link>
                    )}
                    {!user && (
                      <span className="d-inline-flex align-items-center">
                        <Link
                          to={`/sign-in`}
                        >{`Log in to Participate >>`}</Link>
                      </span>
                    )}
                    <span className="d-inline-flex align-items-center">
                      <Link
                        to={`/contest/${ckey}/standing`}
                      >{`Current Standing >>`}</Link>
                    </span>
                  </>
                )
              }

              {type === "past" && (
                <>
                  <span className="d-inline-flex align-items-center">
                    <Link
                      to={`/contest/${ckey}/standing`}
                    >{`Standing >>`}</Link>
                  </span>
                </>
              )}
            </div>
          }
        </td>
      </tr>
    );
  }
}

interface NPContestListProps {
  selectedOrg: { slug?: string | null };
  user: UserShape | null;
  profile?: ProfileShape | null;
  [key: string]: unknown;
}

interface NPContestListState {
  contests: {
    active: ContestShape[];
    present: ContestShape[];
    future: ContestShape[];
  };
  loaded: boolean;
  errors: unknown;
}

class NPContestList extends React.Component<NPContestListProps, NPContestListState> {
  constructor(props: NPContestListProps) {
    super(props);
    this.state = {
      contests: {active: [], present: [], future: []},
      loaded: false,
      errors: null,
    };
  }

  callApi() {
    this.setState({loaded: false, errors: null});

    let prms: Record<string, unknown> = {};
    if (this.props.selectedOrg.slug) {
      prms.org = this.props.selectedOrg.slug;
    }

    contestAPI
      .getContests(prms)
      .then((cont: { data: { active: ContestShape[]; present: ContestShape[]; future: ContestShape[] } }) => {
        this.setState({
          contests: cont.data,
          loaded: true,
        });
      })
      .catch((err: { response?: { data: unknown } }) => {
        this.setState({
          loaded: true,
          errors: err.response?.data || "Cannot fetch contests at the moment.",
        });
      });
  }

  componentDidMount() {
    this.callApi();
  }
  componentDidUpdate(prevProps: NPContestListProps, _prevState: NPContestListState) {
    if (prevProps.selectedOrg !== this.props.selectedOrg) {
      this.callApi();
    }
  }

  render() {
    const {contests} = this.state;
    return (
      <div className="npast-contest">
        <h4>Ongoing/Upcoming Contests</h4>
        <ErrorBox errors={this.state.errors as string | string[] | Record<string, unknown> | null} />
        <Table responsive hover size="sm" striped bordered className="rounded">
          <thead>
            <tr>
              <th style={{width: "13%"}}>#</th>
              <th style={{width: "30%"}}>Name</th>
              <th className="contest-start">When</th>
              <th style={{width: "8%"}}>Duration</th>
              <th className="participate-options">Participate</th>
            </tr>
          </thead>
          <tbody>
            {this.state.loaded === false && (
              <tr>
                <td colSpan={6}>
                  <SpinLoader margin="10px" />
                </td>
              </tr>
            )}
            {this.state.loaded === true && !this.state.errors && (
              <>
                {this.state.contests.active.map((cont, idx) => (
                  <ContestListItem
                    key={`cont-${cont.key}`}
                    rowid={idx}
                    data={cont}
                    user={this.props.user}
                    profile={this.props.profile}
                    refetch={() => this.callApi()}
                    type="active"
                  />
                ))}
                {this.state.contests.present.map((cont, idx) => (
                  <ContestListItem
                    key={`cont-${cont.key}`}
                    rowid={idx}
                    data={cont}
                    user={this.props.user}
                    profile={this.props.profile}
                    refetch={() => this.callApi()}
                    type="present"
                  />
                ))}
                {this.state.contests.future.map((cont, idx) => (
                  <ContestListItem
                    key={`cont-${cont.key}`}
                    rowid={idx}
                    data={cont}
                    user={this.props.user}
                    profile={this.props.profile}
                    refetch={() => this.callApi()}
                    type="future"
                  />
                ))}
                {contests.active.length +
                  contests.present.length +
                  contests.future.length ===
                  0 && (
                  <>
                    <tr>
                      <td colSpan={99}>
                        <em>No contest planned yet.</em>
                      </td>
                    </tr>
                  </>
                )}
              </>
            )}
          </tbody>
        </Table>
      </div>
    );
  }
}

interface ContestListProps {
  user: UserShape | null;
  profile?: ProfileShape | null;
  selectedOrg: { slug?: string | null };
  [key: string]: unknown;
}

interface ContestListState {
  pastContests: ContestShape[];
  currPage: number;
  pageCount: number;
  count: number;

  loaded: boolean;
  errors: unknown;
}

class ContestList extends React.Component<ContestListProps, ContestListState> {
  constructor(props: ContestListProps) {
    super(props);
    this.state = {
      pastContests: [],
      currPage: 0,
      pageCount: 1,
      count: 0,

      loaded: false,
      errors: null,
    };
    setTitle("Contests");
  }

  callApi(params = {page: 0}) {
    this.setState({loaded: false, errors: null});

    let prms: Record<string, unknown> = {page: params.page + 1};
    if (this.props.selectedOrg.slug) {
      prms.org = this.props.selectedOrg.slug;
    }

    contestAPI
      .getPastContests(prms)
      .then((pastcont: { data: { results: ContestShape[]; count: number; total_pages: number } }) => {
        this.setState({
          pastContests: pastcont.data.results,
          count: pastcont.data.count,
          pageCount: pastcont.data.total_pages,
          currPage: params.page,
          loaded: true,
        });
      })
      .catch((err: { response?: { data: unknown } }) => {
        this.setState({
          loaded: true,
          errors: err.response?.data || "Cannot fetch contests at the moment.",
        });
      });
  }

  componentDidMount() {
    this.callApi({page: this.state.currPage});
  }
  componentDidUpdate(prevProps: ContestListProps, _prevState: ContestListState) {
    if (prevProps.selectedOrg !== this.props.selectedOrg) {
      this.callApi();
    }
  }

  handlePageClick = (event: { selected: number }) => {
    this.callApi({page: event.selected});
  };

  render() {
    const {pastContests, errors, loaded, count} = this.state;
    return (
      <>
        <div className="contest-table wrapper-vanilla">
          <NPContestList {...this.props} />
        </div>
        <hr className="m-2" />
        <div className="contest-table wrapper-vanilla">
          <div className="past-contest">
            <h4>Past Contests</h4>
            <ErrorBox errors={errors as string | string[] | Record<string, unknown> | null} />
            <Table
              responsive
              hover
              size="sm"
              striped
              bordered
              className="rounded"
            >
              <thead>
                <tr>
                  <th style={{width: "13%"}}>#</th>
                  <th style={{width: "30%"}}>Name</th>
                  <th className="contest-start">When</th>
                  <th style={{width: "8%"}}>Duration</th>
                  <th className="participate-options">Participate</th>
                </tr>
              </thead>
              <tbody>
                {loaded === false && (
                  <tr>
                    <td colSpan={6}>
                      <SpinLoader margin="10px" />
                    </td>
                  </tr>
                )}
                {loaded === true && (
                  <>
                    {pastContests.map((cont, idx) => (
                      <ContestListItem
                        key={`cont-${cont.key}`}
                        rowid={idx}
                        data={cont}
                        user={this.props.user}
                        type="past"
                      />
                    ))}
                    {count === 0 && (
                      <tr>
                        <td colSpan={99}>
                          <em>No contest yet.</em>
                        </td>
                      </tr>
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
                  pageLabelBuilder={(page: number) => `[${page}]`}
                  pageRangeDisplayed={3}
                  pageCount={this.state.pageCount}
                  renderOnZeroPageCount={null}
                  previousLabel={null}
                  nextLabel={null}
                />
              </span>
            )}
          </div>
        </div>
      </>
    );
  }
}

let wrapped: React.ComponentType<ContestListProps> = ContestList as React.ComponentType<ContestListProps>;
const mapStateToProps = (state: {
  user: { user: UserShape | null };
  profile: { profile: ProfileShape | null };
  myOrg: { selectedOrg: { slug?: string | null } };
}) => {
  return {
    user: state.user.user,
    profile: state.profile.profile,
    selectedOrg: state.myOrg.selectedOrg,
  };
};
export default connect(mapStateToProps, null)(wrapped);
