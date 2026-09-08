import React from "react";

import { Link } from "react-router";

import { SpinLoader } from "components";

import ContestContext from "context/ContestContext";

interface ContestShape {
  key: string;
  name: string;
  start_time?: string;
  end_time?: string | null;
  time_limit?: string;
  [key: string]: unknown;
}

interface ContestSidebarState {
  label: string;
  time_left: number | null;
  contest: ContestShape | null;
}

class ContestSidebar extends React.Component<{}, ContestSidebarState> {
  static contextType = ContestContext;
  context!: React.ContextType<typeof ContestContext>;

  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      label: "...",
      time_left: null,
      contest: null,
    };
  }

  get time_limit(): string {
    return this.state.contest?.time_limit as string;
  }

  updateTimeLeftLabel() {
    const t = this.state.time_left;
    if (t === null) return;
    if (t <= 0) {
      this.setState({ label: "Finished" });
      if (this.timer) clearInterval(this.timer);
      return;
    }

    let s = t % 60;
    let m = Math.floor(t / 60);
    let h = Math.floor(m / 60);
    m = m % 60;
    let label =
      (h < 10 ? "0" : "") +
      h +
      ":" +
      (m < 10 ? "0" : "") +
      m +
      ":" +
      (s < 10 ? "0" : "") +
      s +
      " left";
    this.setState({ label });
  }

  componentDidUpdate(prevProps: {}, prevState: ContestSidebarState) {
    const contest = this.context.contest as ContestShape | null;
    if (prevState.contest !== contest) {
      this.setState({ contest });

      if (contest) {
        let start_time = new Date(contest.start_time ?? "").getTime();
        let end_time = new Date(contest.end_time ?? "").getTime();
        if (!contest.end_time) {
          const hms = this.time_limit;
          const a = hms.split(":");
          const seconds = +a[0] * 60 * 60 + +a[1] * 60 + +a[2];
          end_time = start_time + seconds * 1000;
        }
        this.setState({ time_left: Math.floor((end_time - new Date().getTime()) / 1000) });
      }

      if (this.timer) clearInterval(this.timer);
      this.timer = setInterval(() => {
        let t = this.state.time_left;
        if (typeof t === "number")
          this.setState({ time_left: t - 1 }, () => this.updateTimeLeftLabel());
      }, 1000);
    }
  }

  componentDidMount() {
    this.setState({ contest: this.context.contest as ContestShape | null });
  }
  componentWillUnmount() {
    if (this.timer) clearInterval(this.timer);
  }

  render() {
    const contest = this.state.contest;
    if (!contest)
      return (
        <div className="wrapper-vanilla" id="contest-sidebar">
          <h5>
            <div className="loading_3dot d-block">Loading</div>
          </h5>
          <div className="flex-center">
            <SpinLoader margin="10px" />
          </div>
        </div>
      );

    return (
      <div className="wrapper-vanilla" id="contest-sidebar">
        <h5 style={{ paddingBottom: "unset", fontSize: "14px" }}>
          <span>
            <Link to={`/contest/${contest.key}`}>Currently participating</Link>
          </span>
        </h5>
        <h5>
          <span>
            <Link to={`/contest/${contest.key}`}>{String(contest.name)}</Link>
          </span>
        </h5>
        <div>
          <span>
            {`Time remaining: `}
            {this.state.label}
          </span>
        </div>
      </div>
    );
  }
}

export default ContestSidebar;