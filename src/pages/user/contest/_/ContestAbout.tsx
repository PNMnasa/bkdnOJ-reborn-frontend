import React from "react";
import {VscInfo} from "react-icons/vsc";
import {Badge, Button} from "react-bootstrap";
import {toast} from "react-toastify";

import {RichTextEditor} from "components";
import contestAPI from "api/contest";
import {setTitle} from "helpers/setTitle";
import {secondsToHHMMSS} from "helpers/durationFormatter";

// Contexts
import ContestContext from "context/ContestContext";

// Styles
import "pages/user/problem/__List.scss";
import "./ContestAbout.scss";

interface ContestAboutProps {
  [key: string]: unknown;
}

class ContestAbout extends React.Component<ContestAboutProps> {
  static contextType = ContestContext;
  declare context: Record<string, unknown>;

  constructor(props: ContestAboutProps) {
    super(props);
    setTitle("About");
  }

  componentDidMount() {
    const contest = this.context.contest as { name?: string } | undefined;
    setTitle(`${contest?.name} | About`);
  }

  render() {
    const contest = this.context.contest as { description?: string } | undefined;
    const description = contest?.description;
    return (
      <div className="wrapper-vanilla m-0.5 contest-about">
        <ContestInfo />
        <hr className="my-2 mx-2" />
        <ContestAuthors />
        {description ? (
          <RichTextEditor value={description} enableEdit={false} />
        ) : (
          <div className="flex-center-col" style={{height: "200px"}}>
            <VscInfo size={30} color="red" />
            <h4>No information given</h4>
          </div>
        )}
      </div>
    );
  }
}

interface ContestInfoShape {
  start_time?: string;
  end_time?: string;
  user_count?: number;
  is_rated?: boolean;
  format_name?: string;
  is_registered?: boolean;
  register_allow?: string;
  key?: string;
  [key: string]: unknown;
}

const ContestInfo = () => {
  const {contest} = React.useContext(ContestContext) as { contest: ContestInfoShape };

  const startTime = new Date(contest.start_time as string);
  const endTime = new Date(contest.end_time as string);
  const contestLength = (endTime.getTime() - startTime.getTime()) / 1000;
  let contestLengthString = "";
  if (contestLength > 0) {
    contestLengthString = secondsToHHMMSS(contestLength)
  }

  return (
    <div className="row px-2 pt-2">
      <div className="contest-info col-8">
        <Badge
          bg="info"
          title="Number of participants"
          data-toogle="tooltip"
        >
          {`${contest?.user_count} participants`}
        </Badge>
        <Badge bg="info" title="Contest's duration" data-toogle="tooltip">
          {`duration ${contestLengthString}`}
        </Badge>
        <Badge bg={contest.is_rated ? "danger" : "success"}>{contest.is_rated ? "rated" : "unrated"}</Badge>
        <Badge bg={contest.format_name === "icpc" ? "danger" : "warning"} title="Contest format" data-toogle="tooltip">
          {contest.format_name}
        </Badge>
      </div>
      <div className="col-auto d-flex align-items-center ml-auto">
        <JoinContestBtn />
      </div>
    </div>
  );
};

const JoinContestBtn = () => {
  const {contest} = React.useContext(ContestContext) as { contest: ContestInfoShape };
  const contestKey = contest.key;

  let isAllowToRegister = true;
  let tooltipText: string | undefined;
  let displayText: string | undefined;
  if (contest.is_registered) {
    displayText = "Registered";
    tooltipText = "Registered";
  } else {
    if (contest.register_allow === "LIVE") {
      displayText = "Participate";
      tooltipText = "Join as a Participant";
    } else if (contest.register_allow === "SPECTATE") {
      tooltipText = "Join as a Spectator";
      displayText = "Spectate";
    } else {
      isAllowToRegister = false;
      displayText = "Register";
      tooltipText = "Register is not allowed";
    }
  }

  const isDisable = !isAllowToRegister || !!contest.is_registered;

  const registerContest = (ckey: string, ooc?: boolean) => {
    let conf;
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
      .finally(() => {});
  };

  const onRegister = () => {
    if (!isDisable)
      return registerContest(contestKey as string, contest.register_allow === "SPECTATE");
  };

  return (
    <Button
      disabled={isDisable}
      variant={isDisable ? "secondary" : "primary"}
      onClick={onRegister}
      size="sm"
      title={tooltipText}
      data-toogle="tooltip"
    >
      {isAllowToRegister ? displayText : <s>{displayText}</s>}
    </Button>
  );
};

const ContestAuthors = () => {
  const {contest} = React.useContext(ContestContext) as { contest: { authors?: { username: string }[] } };

  const isHidden = contest.authors?.length === 0;
  const authorList = () => {
    return contest.authors?.map((author, idx) => (
      <a
        href="#"
        className="contest-author"
        key={`contest-author-${author.username}`}
      >
        {author.username}
        {idx !== contest.authors!.length - 1 ? ", " : ""}
      </a>
    ));
  };

  return (
    <div className="d-flex flex-wrap px-2 mb-2">
      <span className="mr-1 text-info">Contest Authors:</span>
      {isHidden ? <i className="text-secondary">hidden</i> : authorList()}
    </div>
  );
};

export default ContestAbout;
