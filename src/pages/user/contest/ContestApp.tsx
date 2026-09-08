/* eslint-disable react/jsx-key */
import React from "react";
import {toast} from "react-toastify";
import {connect} from "react-redux";

import {Outlet, useNavigate} from "react-router";
import {VscError} from "react-icons/vsc";

import {OneColumn} from "layout";

import {SpinLoader} from "components";

import contestAPI from "api/contest";
import {withParams, withNavigation} from "helpers/react-router";

import "styles/ClassicPagination.css";
import "./ContestApp.css";

// Context Components
import {ContestNav, ContestBanner, ContestController} from "./_";

// Context
import {ContestProvider} from "context/ContestContext";
import {addContest} from "redux/StandingFilter/action";

/*

  [ Nav ---------------------------------------- ]

  [                   Contest                    ]
  [             Time Left: 00:15:09              ]
  [ -------------------------------------------- ]
  [ Prob | Sub | Standing                        ]

  [                       ] [                    ]
  [                       ] [  Other component   ]
  [         BODY          ] [                    ]
  [                       ]
  [                       ]

*/
const DESCRIPTION_POLL_DURATION_MS = 60 * 1000;

interface ContestShape {
  key: string;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  updated_recently?: boolean;
  is_registered?: boolean;
  spectate_allow?: boolean;
  [key: string]: unknown;
}

interface ContestAppProps {
  params: Record<string, string | undefined>;
  navigate: ReturnType<typeof useNavigate>;
  standingFilter: Record<string, unknown>;
  addContestFilter: (contestId: string) => void;
  [key: string]: unknown;
}

interface ContestAppState {
  loaded: boolean;
  contest_key: string | undefined;
  contest: ContestShape | null;
  redirectUrl: string | null;

  showNav: boolean;
  errors?: unknown;
}

class ContestApp extends React.Component<ContestAppProps, ContestAppState> {
  private pollDescIntr?: ReturnType<typeof setInterval>;

  constructor(props: ContestAppProps) {
    super(props);

    this.state = {
      loaded: false,
      contest_key: this.props.params.key,
      contest: null,
      redirectUrl: null,

      showNav: true,
    };
  }

  getContestStatus(contest: ContestShape): string | null {
    if (!contest) return null;

    const start_time = new Date(contest.start_time);
    const end_time = new Date(contest.end_time);
    if (isNaN(start_time.getTime()) || isNaN(end_time.getTime())) return null;

    let now = new Date();
    if (now < start_time) {
      return "not-started";
    } else if (now <= end_time) {
      return "running";
    } else {
      return "ended";
    }
  }

  pollDescription() {
    contestAPI.getContest({key: this.state.contest_key!, params: {"description": 1}})
    .then((res: { data: { updated_recently?: boolean; description?: string } }) => {
      const data = res.data;
      const contest = this.state.contest;
      if (data.updated_recently && contest) {
        if (data.description !== contest.description) {
          this.setState({ contest: {...contest, description: data.description} })
          window.alert("Có cập nhập mới đến các đội, xin hãy xem ở mục About.")
        }
      }
    })
    .catch(() => {
      clearInterval(this.pollDescIntr)
    })
  }
  componentWillUnmount(){
    clearInterval(this.pollDescIntr)
  }

  componentDidMount() {
    contestAPI
      .getContest({key: this.state.contest_key!})
      .then((res: { data: ContestShape }) => {
        let contest = res.data;

        contest.status = this.getContestStatus(contest) as unknown;
        this.setState({
          contest: contest,
          loaded: true,
        }, () => {
          if (contest.updated_recently) {
            window.alert("Có cập nhập mới đến các đội, xin hãy xem ở mục About.")
          }
        });

        const contestId = contest.key;
        if (!Object.hasOwn(this.props.standingFilter, contestId)) {
          this.props.addContestFilter(contestId);
        }
        clearInterval(this.pollDescIntr)
        this.pollDescIntr = setInterval(() => this.pollDescription(), DESCRIPTION_POLL_DURATION_MS)
      })
      .catch((err: { response?: { data?: unknown; status?: number } }) => {
        this.setState({
          loaded: true,
          errors: err.response?.data || ["Contest not available"],
        });
        let msg =
          ((err.response?.data as { detail?: string } | undefined) &&
            (err.response?.data as { detail?: string }).detail) ||
          `Contest is not available. (${err.response?.status || "NETWORK_ERR"})`;

        toast.error(msg, {
          toastId: "contest-na",
          autoClose: false,
        });
      });
  }

  render() {
    const {contest, loaded, showNav} = this.state;

    let mains: React.ReactNode[] = contest
      ? [
          <ContestBanner contestLoaded={loaded} contest={contest} />,
          <ContestNav />,
          <Outlet />,
        ]
      : !loaded
      ? [
          <div className="shadow flex-center" style={{height: "200px"}}>
            <SpinLoader margin="0" />
          </div>,
        ]
      : [
          <div className="shadow flex-center-col" style={{height: "200px"}}>
            <h4>Contest Not Available</h4>
            <hr style={{width: "50%"}} className="mt-1" />
            <VscError size={30} color="red" />
          </div>,
        ];

    return (
      <div id="contest-app">
        <ContestProvider value={{contest}}>
          {contest && (
            <ContestController
              showNav={showNav}
              setShowNav={v => this.setState({showNav: v})}
              ckey={contest.key}
            />
          )}
          <OneColumn mainContent={mains} />
        </ContestProvider>
      </div>
    );
  }
}

let wrapped = withParams(ContestApp as never) as never;
wrapped = withNavigation(wrapped) as never;

const mapStateToProps = (state: {
  user: { user: unknown };
  contest: { contest: unknown };
  standingFilter: { standingFilter: Record<string, unknown> };
}) => {
  return {
    user: state.user.user,
    contest: state.contest.contest,
    standingFilter: state.standingFilter.standingFilter,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    addContestFilter: (contestId: string) => dispatch(addContest({contestId})),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(wrapped) as unknown as React.ComponentType;
