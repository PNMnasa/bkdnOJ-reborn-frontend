import React from "react";
import {toast} from "react-toastify";
import {connect} from "react-redux";
import {Button, Table} from "react-bootstrap";
import {Link} from "react-router";

import {SpinLoader, ErrorBox, UserCard} from "components";
import SubListModal from "./SubListModal";
import StandingFilter from "./StandingFilter";

import contestAPI from "api/contest";

// Helpers
import {setTitle} from "helpers/setTitle";
import {getLocalDateWithTimezone} from "helpers/dateFormatter";
import {fileFromBlob} from "helpers/file-utils";

// Assets
import top1 from "assets/common/atcoder_top1.png";
import top10 from "assets/common/atcoder_top10.png";
import top30 from "assets/common/atcoder_top30.png";
import top100 from "assets/common/atcoder_top100.png";

import {GiIceCube} from "react-icons/gi";
import {FaUniversity} from "react-icons/fa";
import {AiOutlineEye} from "react-icons/ai";
import {BiSpreadsheet, BiTargetLock} from "react-icons/bi";

// Contexts
import ContestContext from "context/ContestContext";

// Styles
import "./ContestStanding.scss";
import "styles/Ratings.scss";
import { addClass } from "helpers/dom_functions";

const __STANDING_POLL_DELAY = 5000;
const __STANDING_HIGHLIGHT_TIME = 5000;

const getClassNameFromPoint = (point: number | undefined, maxPoint: number) => {
  let ptsClsName = "";
  if (maxPoint > 0) {
    const percent = Math.round(((point || 0) / maxPoint) * 100);

    if (percent <= 25) ptsClsName = "one-fourth";
    else if (percent <= 50) ptsClsName = "two-fourth";
    else if (percent <= 75) ptsClsName = "three-fourth";
    else if (percent < 100) ptsClsName = "four-fourth";
    else ptsClsName = "full-points";
  }
  return ptsClsName;
};

const getStandingCellKey = (username: string, problem_code: string) => {
  if (!username) username = ""
  if (!problem_code) problem_code = ""
  return `standing-cell-${username}-${problem_code.toLowerCase()}`
}

interface StandingUserShape {
  username: string;
  first_name?: string;
  last_name?: string;
  rating?: number;
  avatar?: string;
  [key: string]: unknown;
}

interface StandOrgShape {
  slug: string;
  name: string;
  short_name?: string;
  logo_url?: string;
  [key: string]: unknown;
}

interface ProblemMapEntry {
  pos: number;
  points: number;
  shortname: string;
}

interface StandingProblemShape {
  id: string;
  points: number;
  shortname: string;
  label: string;
  partial?: boolean;
  [key: string]: unknown;
}

interface StandingRowShape {
  user: string;
  score: number;
  cumtime: number;
  frozen_score?: number;
  frozen_cumtime?: number;
  format_data?: string;
  format_data_compact?: string;
  fullname?: string;
  organization?: StandOrgShape;
  [key: string]: unknown;
}

interface StandingItemProps {
  rowIdx: number;
  user: string;
  score: number;
  cumtime: number;
  frozen_score?: number;
  frozen_cumtime?: number;
  format_data?: string;
  isFavorite?: boolean;
  filteredRank?: number;
  contestId?: string;
  userMapping: Record<string, StandingUserShape>;
  probMapping: Record<string, ProblemMapEntry>;
  orgMapping: Record<string, StandOrgShape>;
  isFrozen: boolean;
  displayMode?: string;
  className?: string;
  orgOverride?: StandOrgShape | null;
  contest?: { format_name?: string; [key: string]: unknown };
  setSubListData: (data: { user: string; problem: string }) => void;
  bestSolutions?: unknown;
  setBestSolutions?: (best: unknown) => void;
  [key: string]: unknown;
}

class StandingItem extends React.Component<StandingItemProps> {
  render() {
    const {
      rowIdx,
      user,
      score,
      cumtime,
      frozen_score,
      frozen_cumtime,
      format_data,
      isFavorite,
      filteredRank,
      contestId,
    } = this.props;

    const {userMapping, probMapping, orgMapping, isFrozen} = this.props;

    let best: React.ReactNode[] = Array(Object.keys(probMapping).length).fill(<></>);
    let data = JSON.parse(format_data || "{}") as Record<
      string,
      { points?: number; sub_time?: number; tries?: number; tries_after_frozen?: number }
    >;
    if (data && data.constructor === Object)
      Object.keys(data).forEach(k => {
        const prob_data = data[k];

        if (!probMapping[k]) return;

        const i = probMapping[k].pos;
        const problemMaxPoints = probMapping[k].points;

        const {points, sub_time, tries, tries_after_frozen} = prob_data;

        const ptsClsName = getClassNameFromPoint(points, problemMaxPoints);

        let displaySubTime = sub_time || 0;
        if (this.props.contest?.format_name === "icpc") displaySubTime = Math.floor((sub_time || 0) / 60)
        else
        if (this.props.contest?.format_name === "ioi") displaySubTime = Math.floor(sub_time || 0)

        best[i] = (
          <div
            className={
              `flex-center-col points-container ` +
              ((tries_after_frozen || 0) > 0 ? "frozen" : ptsClsName)
            }
            id={getStandingCellKey(user, probMapping[k].shortname)}
            onClick={() =>
              this.props.setSubListData({
                user,
                problem: probMapping[k].shortname,
              })
            }
          >
            <div className={`p-best-points points ${ptsClsName}`}>
              {`${points}`}
              {(!!tries || !!tries_after_frozen) && (
                <span className="extra">
                  (<span className="tries">{tries}</span>
                  {(tries_after_frozen || 0) > 0 && (
                    <span className="frozen_tries">+{tries_after_frozen}</span>
                  )}
                  )
                </span>
              )}
            </div>

            <div className="p-best-time text-truncate time">{displaySubTime}</div>
          </div>
        );
      });

    let showScore: number | undefined, showCumtime: number | undefined;
    if (isFrozen) {
      showScore = frozen_score;
      showCumtime = frozen_cumtime;
    } else {
      showScore = score;
      showCumtime = cumtime;
    }

    let org: StandOrgShape | undefined;
    try {
      org = this.props.orgOverride || orgMapping[userMapping[user].organization as string] || undefined;
    } catch (_err) {
      // console.log(err)
    }

    return (
      <tr id={`standing-${user}`} className={this.props.className}>
        <td className="td-rank">
          <div className="flex-center rank-display">
            <div className="rank-position">{rowIdx + 1}</div>
            {rowIdx === 0 ? <img src={top1} alt="Top 1 Icon" /> : ""}
            {0 < rowIdx && rowIdx < 10 ? (
              <img src={top10} alt="Top 10 Icon" />
            ) : (
              ""
            )}
            {10 <= rowIdx && rowIdx < 30 ? (
              <img src={top30} alt="Top 30 Icon" />
            ) : (
              ""
            )}
            {30 <= rowIdx && rowIdx < 100 ? (
              <img src={top100} alt="Top 100 Icon" />
            ) : (
              ""
            )}
          </div>
          {filteredRank && (
            <span
              className="text-secondary"
              title="Rank in filtered team"
              data-toogle="tooltip"
              data-placement="right"
            >
              (#{filteredRank})
            </span>
          )}
        </td>
        <td className="td-participant">
          {userMapping && user in userMapping ? (
            <UserCard
              displayMode={this.props.displayMode}
              user={userMapping[user]}
              organization={org}
              ranks={[]}
              isFavorite={isFavorite}
              contestId={contestId}
            />
          ) : (
            <span>{user}</span>
          )}
        </td>

        <td className="td-total">
          <div className="flex-center-col">
            <div className="p-best-points points">{showScore}</div>
            <div className="p-best-time text-truncate time">{showCumtime}</div>
          </div>
        </td>

        {best.map((c, i) => (
          <td className="td-p-best" key={`ct-st-pb-${user}-${i}`}>
            {c}
          </td>
        ))}
      </tr>
    );
  }
}

interface StandingFilterEntryShape {
  isOrgFilterEnable?: boolean;
  isFavoriteOnly?: boolean;
  filteredOrg?: string[];
  favoriteTeams?: string[];
  [key: string]: unknown;
}

interface ContestStandingProps {
  user: StandingUserShape | null;
  standingFilter: Record<string, StandingFilterEntryShape>;
  [key: string]: unknown;
}

interface ContestStatusShape {
  key: string;
  name?: string;
  is_registered?: boolean;
  spectate_allow?: boolean;
  [key: string]: unknown;
}

interface SubListDataShape {
  user: string;
  problem: string;
}

interface BestSolutionShape {
  user: string;
  points: number;
  sub_time: number;
}

interface ContestStandingState {
  probId2idx: Record<string, ProblemMapEntry>;
  orgMapping: Record<string, StandOrgShape>;
  userMapping: Record<string, StandingUserShape> | null;

  problems: StandingProblemShape[] | null;
  organizations: StandOrgShape[];
  standing: StandingRowShape[];
  bestSolutions: Record<string, BestSolutionShape>;

  isFrozen: boolean;
  frozenEnabled: boolean;
  frozenTime?: string;
  canBreakIce: boolean;
  iceBroken: boolean;

  displayMode: "user" | "org";

  loaded: boolean;
  errors: unknown;

  contest: ContestStatusShape | null;
  user: StandingUserShape | null;
  scoreboardCache: number;

  isPollingOn: boolean;
  isPolling: boolean;

  subListShow: boolean;
  subListData: SubListDataShape | null;
  highlightUser: string;

  filterEnabled: boolean;
  filteredRanks: number[];
}

class ContestStanding extends React.Component<ContestStandingProps, ContestStandingState> {
  static contextType = ContestContext;
  context: Record<string, unknown> = {};

  private timer?: ReturnType<typeof setInterval>;

  constructor(props: ContestStandingProps) {
    super(props);
    this.state = {
      probId2idx: {},
      orgMapping: {},
      userMapping: null,

      problems: null,
      organizations: [],
      standing: [],
      bestSolutions: {},

      isFrozen: true,
      frozenEnabled: false,
      canBreakIce: false,
      iceBroken: false,

      displayMode: "user",

      loaded: false,
      errors: null,

      contest: null,
      user: null,
      scoreboardCache: 0,

      isPollingOn: true,
      isPolling: false,
      // SubList Modal
      subListShow: false,
      subListData: null,
      highlightUser: "",

      // Filters
      filterEnabled: false,
      filteredRanks: [],
    };
  }

  setSubListData(data: SubListDataShape) {
    this.setState({subListShow: true, subListData: data});
  }

  clearSubListData() {
    this.setState({subListShow: false, subListData: null});
  }

  /* Set viewing mode of scoreboard to not frozen */
  meltingIce() {
    this.setState({iceBroken: true}, () => this.refetch());
  }

  /* Set viewing mode of scoreboard to Frozen */
  freezingIce() {
    this.setState({iceBroken: false}, () => this.refetch());
  }

  /* Hide certain rows based on Standing Filters */
  filterStanding() {
    const contestId = this.state.contest?.key;
    const standingFilter: StandingFilterEntryShape =
      (contestId && this.props.standingFilter[contestId]) || {};
    const participants = this.state.standing

    const {
      isOrgFilterEnable,
      isFavoriteOnly,
      filteredOrg,
      favoriteTeams,
    } = standingFilter;

    const isFilterEnable = isOrgFilterEnable || isFavoriteOnly;
    let baseFilteredRank = 1;

    let filteredRankOfParticipants: number[] = Array(participants.length).fill(0);
    let filterEn: boolean;
    if (!isFilterEnable) {
      filterEn = false;
    } else {
      filterEn = true;
      participants.forEach((part, idx) => {
        const {user} = part;
        const isFavorite = (favoriteTeams || []).includes(user);
        const orgName = this.state.userMapping?.[user]?.organization as string | undefined;
        const isShow = ((filteredOrg || []).includes(orgName || "") && !!isOrgFilterEnable) ||
          (isFavorite && !!isFavoriteOnly) ;
        if (isShow) {
          filteredRankOfParticipants[idx] = baseFilteredRank++
        }
      })
    }
    this.setState({
      filterEnabled: filterEn,
      filteredRanks: filteredRankOfParticipants,
    })
  }

  /* Receive results of Contest Standing api and handle */
  handleContestStanding(res: {
    data: {
      results: StandingRowShape[];
      problems: StandingProblemShape[];
      organizations: StandOrgShape[];
      is_frozen_enabled?: boolean;
      frozen_time?: string;
      is_frozen?: boolean;
      can_break_ice?: boolean;
      scoreboard_cache_duration?: number;
    };
  }) {
    this.setState({
      loaded: true,
      isPolling: false,

      standing: res.data.results,
      bestSolutions: {},

      problems: res.data.problems,
      organizations: res.data.organizations,

      frozenEnabled: res.data.is_frozen_enabled || false,
      frozenTime: res.data.frozen_time,
      isFrozen: res.data.is_frozen || false,
      canBreakIce: res.data.can_break_ice || false,

      scoreboardCache: res.data.scoreboard_cache_duration || 0,
    });

    // Contest - Problems mapping
    let problemMap: Record<string, ProblemMapEntry> = {};
    let uniq = 0;
    res.data.problems.forEach(prob => {
      if (problemMap[prob.id]) return;
      problemMap[prob.id] = {
        pos: uniq,
        points: prob.points,
        shortname: prob.shortname,
      };
      uniq++;
    });
    this.setState({probId2idx: problemMap});

    // Contest - Organization mapping
    let organizationMap: Record<string, StandOrgShape> = {};
    res.data.organizations.forEach(org => {
      organizationMap[org.slug] = org;
    });
    this.setState({orgMapping: organizationMap});

    // Best Solutions -
    let bestSolutionMap: Record<string, BestSolutionShape> = {}
    res.data.results.forEach((row: StandingRowShape) => {
      try {
        let data = JSON.parse(row.format_data || "{}") as Record<
          string,
          { sub_time?: number; points?: number }
        >;
        const user = row.user;

        Object.keys(data).forEach(probId => {
          const prob = problemMap[probId]
          if (!prob) return;
          const probCode = prob.shortname;
          const {sub_time, points} = data[probId];

          let shouldUpdate = false;
          if (points === 0) return;
          if (!bestSolutionMap[probCode]) shouldUpdate = true
          else {
            if ((points || 0) > 0 && bestSolutionMap[probCode].points < (points || 0)) shouldUpdate = true;
            else
            if (
              bestSolutionMap[probCode].points === points &&
              bestSolutionMap[probCode].sub_time > (sub_time || 0)
            ) shouldUpdate = true
          }
          if (shouldUpdate)
            bestSolutionMap = {
              ...bestSolutionMap,
              [probCode]: {user, points: points || 0, sub_time: sub_time || 0}
            }
        })
      } catch (_err) {
        // console.log(err)
      }
    })
    this.setState({bestSolutions: bestSolutionMap})
  }

  async refetch(polling = false) {
    // Dont do fetch if user is viewing the modal
    if (this.state.subListShow) return;
    if (!this.state.contest) return;

    if (polling) this.setState({isPolling: true});
    else this.setState({loaded: false, errors: null});

    const params: Record<string, unknown> = this.state.iceBroken ? {view_full: 1} : {view_full: 0};

    let apis: Promise<unknown>[] = [];
    // if participants profiles are not loaded, queue this api
    if (!this.state.userMapping) {
      apis.push(
        contestAPI
          .getContestParticipants({key: this.state.contest!.key})
          .then((res: { data: StandingUserShape[] }) => {
            let userMapping: Record<string, StandingUserShape> = {};
            res.data.forEach(user => {
              userMapping[user.username] = user;
            });
            this.setState({userMapping});
          })
          .catch(err => {
            console.log("Cannot retrieve participants' profile. Maybe F5 after 1 minute to retry again.", err);
          })
      );
    }
    // Contest Standing
    apis.push(
      contestAPI
        .getContestStanding({key: this.state.contest!.key, params})
        .then(res => this.handleContestStanding(res))
        .catch((err: { response?: { data?: unknown; status?: number } }) => {
          clearInterval(this.timer);
          this.setState({
            isPollingOn: false,
            loaded: true,
            errors: err.response?.data,
          }, () => this.filterStanding());
          toast.error(
            `Standing not available at the moment. (${
              err.response?.status || "NETWORK_ERR"
            })`,
            {
              toastId: "contest-standing-na",
            }
          );
        })
    );

    await Promise.all(apis);
  }

  setHighlightUser(username: string) {
    this.setState({highlightUser: username}, () => {
      setTimeout(() => {
        this.setState({highlightUser: ""});
      }, __STANDING_HIGHLIGHT_TIME);
    });
  }
  scrollToCurrentStanding(username: string) {
    const userDiv = document.getElementById(`standing-${username}`);
    if (!userDiv) return;

    userDiv.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    this.setHighlightUser(username);
  }

  setBestSolutions(newBest: unknown): void {
    this.setState({bestSolutions: newBest as Record<string, BestSolutionShape>});
  }

  componentDidMount() {
    this.setState({
      contest: (this.context && this.context.contest as ContestStatusShape) || null,
      user: (this.props && this.props.user) || null,
    });
  }

  componentDidUpdate(prevProps: ContestStandingProps, prevState: ContestStandingState) {
    const {user} = this.props;
    const contest = (this.context.contest as ContestStatusShape) || null;
    if (!contest) return; // skip if no contest

    if (prevState.contest !== contest || prevState.user !== user) {
      this.setState({user, contest}, () => {
        setTitle(`${contest.name} | Standing`);
        this.refetch();
      });
    }
    if (prevProps.standingFilter !== this.props.standingFilter) {
      this.filterStanding();
    }
    this.highlightBestSolutions();

    // TODO: Stop fetching if contest is over?
    let pollDelay = this.state.scoreboardCache * 1000 || __STANDING_POLL_DELAY;
    pollDelay = Math.max(pollDelay, __STANDING_POLL_DELAY);
    clearInterval(this.timer);
    this.timer = setInterval(() => this.refetch(true), pollDelay);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }


  highlightBestSolutions() {
    const bestSolutions = this.state.bestSolutions;
    Object.keys(bestSolutions || {}).forEach(probCode => {
      const {user} = bestSolutions[probCode];
      const bestCellId = getStandingCellKey(user, probCode);
      const elem = document.getElementById(bestCellId);
      if (!elem) return;
      addClass(elem, "fastest");
    })
  }

  generateCSV() {
    const {
      filterEnabled,
      filteredRanks,
      standing,
      problems,
      userMapping,
      probId2idx,
      isFrozen,
    } = this.state;
    const contest = this.context.contest as ContestStatusShape;

    const probList = problems || [];
    const userMap = userMapping || {};

    // prep problem_id to label
    let probId2Label: Record<string, string> = {};
    probList.forEach(prob => { probId2Label[prob.id] = prob.label })

    // preparing csv raw data
    let raw = "frozen,rank,vrank,account,name,org,orgname,score,pen";
    probList.forEach(prob => {
      raw += ",";
      if (prob.label) raw += prob.label;
    })
    raw += "\n";

    const appendToCsvRaw = (csv: string, content?: string, nl=false) => {
      let cc = content || "";
      cc = cc.replaceAll(",", " ")
      if (csv) csv +=",";
      csv += cc;
      if (nl) csv += "\n";
      return csv;
    }

    standing.forEach((part, idx) => {
      // Check skips
      if (filterEnabled && filteredRanks[idx] == 0) return;

      // frozen
      if (isFrozen) raw += "Y";

      // rank, vrank
      let rank = idx+1, vrank = idx+1;
      if (filteredRanks[idx]) vrank = filteredRanks[idx];
      raw += ",";
      raw += ""+rank+","+vrank;

      // account, name
      let fullname = "";
      if (userMap[part.user]) {
        fullname = userMap[part.user].first_name || "";
        if (fullname && userMap[part.user].last_name) fullname += " ";
        fullname += userMap[part.user].last_name || "";
      }
      raw = appendToCsvRaw(raw, part.user)
      raw = appendToCsvRaw(raw, part.fullname)

      // org, orgname
      let org = "", orgname = "";
      if (part.organization) {
        org=part.organization.slug; orgname=part.organization.name;
      }
      raw = appendToCsvRaw(raw, org)
      raw = appendToCsvRaw(raw, orgname)

      // score, pen
      let score: number, pen: number;
      if (isFrozen) {
        score = part.frozen_score || 0; pen = part.frozen_cumtime || 0;
      } else {
        score = part.score; pen = part.cumtime;
      }
      raw += ","+score+","+pen;

      // problems
      let data = JSON.parse(part.format_data || "{}") as Record<
        string,
        { points?: number; tries?: number; sub_time?: number }
      >;
      let cols: Record<string, string> = {}
      Object.keys(data).forEach(probId => {
        const probLabel = probId2Label[probId] || "?";
        const prob = probId2idx[probId]
        if (!prob) return;

        let substat="";
        if (data[probId].points == 0) substat+="0";
        else {
          substat += data[probId].points+"/"+data[probId].tries+"/"+Math.floor((data[probId].sub_time || 0)/60);
        }
        cols[probLabel] = substat;
      })

      probList.forEach(prob => {
        raw += ","
        if (cols[prob.label]) {
          raw += cols[prob.label]
        }
      })
      raw += "\n";
    })

    const blob = new Blob([raw], {type: "application/csv"});
    fileFromBlob(blob, (contest.key ? `${contest.key}${isFrozen ? "-frozen" : ""}-standing.csv` : "standing.csv"));
  }

  render() {
    const {
      loaded,
      problems,
      standing,
      frozenEnabled,
      frozenTime,
      isFrozen,
      canBreakIce,
      displayMode,
      scoreboardCache,
      iceBroken,
      isPolling,

      filterEnabled,
      filteredRanks,
    } = this.state;
    const contestId = this.state.contest?.key;
    const contest = this.context.contest as ContestStatusShape;
    const isRegistered = !!contest?.is_registered;

    // Props
    const standingFilter: StandingFilterEntryShape =
      (contestId && this.props.standingFilter[contestId]) || {};
    const { favoriteTeams } = standingFilter;

    return (
      <div className="wrapper-vanilla p-2" id="contest-standing">
        <div className="standing-lbl">
          <h4 className="standing-head">
            Standing {isPolling && <SpinLoader size="18" margin="0 2px" />}
          </h4>

          <ErrorBox errors={this.state.errors as string | string[] | Record<string, unknown> | null} />

          <div className="flex-center-col standing-notice">
            {scoreboardCache > 0 && (
              <span className="frozen-time">
                Scoreboard is cached for every {scoreboardCache} second(s), it
                will take a while for your submissions to appear here.
              </span>
            )}
            {frozenEnabled &&
              (new Date() < new Date(String(frozenTime || "")) ? (
                <span className="frozen-time">
                  Will be Frozen after {getLocalDateWithTimezone(frozenTime)}.
                </span>
              ) : (
                <span className="frozen-time">
                  Frozen since {getLocalDateWithTimezone(frozenTime)}.
                </span>
              ))}
          </div>

          <div className="standing-options">
            {canBreakIce &&
              (!iceBroken ? (
                <Button
                  variant="light"
                  className="btn-svg"
                  onClick={() => this.meltingIce()}
                >
                  <AiOutlineEye size={20} />
                  <span className="d-none d-md-block">Peek</span>
                </Button>
              ) : (
                <Button
                  variant="dark"
                  className="btn-svg"
                  onClick={() => this.freezingIce()}
                >
                  <GiIceCube size={20} />
                  <span className="d-none d-md-block">Freeze!</span>
                </Button>
              ))}
            {displayMode === "user" ? (
              <Button
                variant="light"
                className="btn-svg"
                onClick={() => this.setState({displayMode: "org"})}
              >
                <FaUniversity size={20} />
                <span className="d-none d-md-block">Show</span>
              </Button>
            ) : (
              <Button
                variant="dark"
                className="btn-svg"
                onClick={() => this.setState({displayMode: "user"})}
              >
                <FaUniversity size={20} />
                <span className="d-none d-md-block">Hide</span>
              </Button>
            )}
            <StandingFilter
              contestId={this.state.contest?.key || ""}
              orgList={this.state.organizations}
            />
            {
              loaded && <>
                <Button
                  variant="light"
                  className="ml-auto btn-svg"
                  onClick={() => this.generateCSV()}
                >
                  <BiSpreadsheet size={20} />
                  <span className="d-none d-md-block">Generate</span>
                  <span>CSV</span>
                </Button>
                { isRegistered && (
                    <Button
                      variant="warning"
                      className="btn-svg "
                      onClick={() => this.scrollToCurrentStanding(this.props.user?.username || "")}
                    >
                      <BiTargetLock size={20} />
                      <span className="d-none d-md-block">My Standing</span>
                    </Button>
                  )
                }
              </>
            }
          </div>
        </div>

        {!loaded && <SpinLoader margin="40px" />}
        {loaded && !this.state.errors && (
          <>
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
                  <th className="th-rank">Rank</th>
                  <th className="th-participant">Participant</th>
                  <th className="th-score">Score</th>
                  {problems &&
                    problems.map((prob, idx) => {
                      const probMode = prob.partial
                        ? `${prob.points}p`
                        : "icpc";
                      const probInfo = prob.partial
                        ? `You can earn partial points from 0pts upto ${prob.points}pts.`
                        : `You either get 0pts or ${prob.points}pts.`;

                      return (
                        <th key={`cs-th-prb-${idx}`} className={`th-p-best`}>
                          <div
                            className="flex-center-col"
                            data-toggle="tooltip"
                            data-placement="bottom"
                            title={probInfo}
                            style={{cursor: "help"}}
                          >
                            <Link to={`/contest/${contest.key}/problem/${prob.shortname}`} style={{color: "black"}}>
                              <strong>{prob.label}</strong>
                            </Link>
                            <div
                              className="border-top "
                              style={{fontSize: "14px", width: "70%"}}
                            >
                              <span>{probMode}</span>
                            </div>
                          </div>
                        </th>
                      );
                    })}
                </tr>
              </thead>
              <tbody>{
                standing.map((part, idx) => {
                  let userFilteredRank: number | undefined = undefined;
                  if (filterEnabled) {
                    userFilteredRank = filteredRanks[idx]
                    if (!userFilteredRank) return <></>;
                  }

                  const {user} = part;
                  const isHighlight = this.state.highlightUser === user;
                  const isFavorite = (favoriteTeams || []).includes(user);

                  return (
                    <StandingItem
                      key={`ct-st-row-${idx}`}
                      className={`scroll__margin ${
                        isHighlight ? "scroll__highlight" : ""
                      }`}
                      orgOverride={part.organization || null}
                      orgMapping={this.state.orgMapping}
                      probMapping={this.state.probId2idx}
                      userMapping={this.state.userMapping as Record<string, StandingUserShape>}
                      rowIdx={idx}
                      isFrozen={isFrozen}
                      displayMode={displayMode}
                      filteredRank={userFilteredRank}
                      isFavorite={isFavorite}
                      contestId={contestId}
                      {...part}
                      setSubListData={d => this.setSubListData(d)}

                      contest={this.context.contest as { format_name?: string; [key: string]: unknown }}
                      bestSolutions={this.state.bestSolutions}
                      setBestSolutions={newBest => this.setBestSolutions(newBest)}
                    />
                  )
              })}</tbody>
            </Table>
            <SubListModal
              show={this.state.subListShow}
              onHide={() => this.clearSubListData()}
              data={{
                ...this.state.subListData,
                contest: (this.state.contest && this.state.contest.key) || "",
              }}
            />
          </>
        )}
      </div>
    )
  }
}

let wrapped: React.ComponentType<any> = ContestStanding as React.ComponentType<any>;
const mapStateToProps = (state: {
  user: { user: StandingUserShape | null };
  standingFilter: { standingFilter: Record<string, StandingFilterEntryShape> };
}) => {
  return {
    user: state.user.user,
    standingFilter: state.standingFilter.standingFilter,
    // profile: state.profile.profile,
  };
};
wrapped = connect(mapStateToProps, null)(wrapped) as React.ComponentType<any>;
export default wrapped;