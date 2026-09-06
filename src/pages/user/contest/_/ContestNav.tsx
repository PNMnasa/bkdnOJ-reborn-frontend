import React from "react";
import {Link, useNavigate, useLocation} from "react-router-dom";

import {withLocation, withNavigation} from "helpers/react-router";
import {addClass, removeClass} from "helpers/dom_functions";

const ContestAppNavHeaders = ["about", "problem", "submission", "standing"];

interface ContestNavProps {
  navigate: ReturnType<typeof useNavigate>;
  location: ReturnType<typeof useLocation>;
  show?: boolean;
  [key: string]: unknown;
}

interface ContestNavState {
  active_app: string;
}

class ContestNav extends React.Component<ContestNavProps, ContestNavState> {
  constructor(props: ContestNavProps) {
    super(props);
    this.state = {
      active_app: "1509",
    };
  }

  setActive(clsname: string) {
    ContestAppNavHeaders.forEach(header => {
      const comp = document.getElementById(`contest-nav-${header}`);
      if (!comp) return;
      if (header === clsname) addClass(comp, "active");
      else removeClass(comp, "active");
    });
  }

  componentDidMount() {
    this.setState({
      active_app: "1509-force-render",
    });
  }

  componentDidUpdate(prevProps: ContestNavProps, prevState: ContestNavState) {
    const splits = this.props.location.pathname.split("/");
    let part: string | undefined = undefined;
    let i = splits.length - 1;
    for (; i >= 0; i--) {
      if ((splits[i].length as unknown as string) === "") continue;
      part = splits[i];
      break;
    }
    if (part && prevState.active_app !== part) {
      this.setState({active_app: part}, () => {
        this.setActive(part as string);
      });
    }
  }

  render() {
    return (
      <>
        <div
          className={`wrapper-vanilla ${
            this.props.show === false ? "d-none" : ""
          }`}
        >
          <div
            className="d-flex text-left"
            style={{flexWrap: "wrap"}}
            id="contest-app-nav"
          >
            <Link
              id={`contest-nav-back`}
              onClick={() => this.props.navigate(-1)}
              to="#"
            >{`<< Back`}</Link>
            <Link to="#">{` | `}</Link>
            {ContestAppNavHeaders.map((st, i) => (
              <Link
                key={`contest-nav-${i}`}
                id={`contest-nav-${st}`}
                onClick={() => this.setActive(st)}
                to={`${st}`}
              >
                {st}
              </Link>
            ))}
          </div>
        </div>
      </>
    );
  }
}
let wrapped = withNavigation(withLocation(ContestNav as never) as never) as never;
export default wrapped as React.ComponentType<Record<string, never>>;
