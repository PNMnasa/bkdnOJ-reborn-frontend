import React from "react";
import {connect} from "react-redux";
import {Button} from "components/bootstrap";
import { FaWrench, VscEye, VscEyeClosed } from "components/icons";



import {addClass, removeClass} from "helpers/dom_functions";
import {withNavigation} from "helpers/react-router";
import {useNavigate} from "react-router";

interface ContestControllerProps {
  showNav: boolean;
  setShowNav: (v: boolean) => void;
  ckey: string;
  user?: { is_staff?: boolean } | null;
  navigate: ReturnType<typeof useNavigate>;
  [key: string]: unknown;
}

class ContestController extends React.Component<ContestControllerProps> {
  constructor(props: ContestControllerProps) {
    super(props);
  }

  toggleNav() {
    const {showNav} = this.props;
    const comp = document.getElementById("one-column-element-i-1");
    if (!comp) return;
    if (showNav) addClass(comp, "d-none");
    else removeClass(comp, "d-none");
    this.props.setShowNav(!showNav);
  }

  render() {
    const {showNav, user} = this.props;
    const isStaff = user && user.is_staff;

    return (
      <div
        className="flex-center"
        style={{
          position: "absolute",
          right: "4px",
          top: "4px",
          columnGap: "2px",
          width: "unset",
          height: "unset",
        }}
      >
        <Button
          onClick={() => this.toggleNav()}
          className="btn-svg"
          id="ct_ctrl_nav"
          style={btnStyle}
          size="sm"
          variant={!showNav ? "light" : "dark"}
        >
          {!showNav ? <VscEye /> : <VscEyeClosed />}
          <span className="d-none d-md-inline">Nav</span>
        </Button>

        {isStaff && (
          <Button
            onClick={() =>
              this.props.navigate(`/admin/contest/${this.props.ckey}`)
            }
            className="btn-svg"
            style={btnStyle}
            size="sm"
            variant="danger"
          >
            <FaWrench />
            <span className="d-none d-md-inline">Adm.</span>
          </Button>
        )}
      </div>
    );
  }
}

let wrapped: React.ComponentType<ContestControllerProps> = ContestController as React.ComponentType<ContestControllerProps>;
wrapped = withNavigation(wrapped as never) as never;
const mapStateToProps = (state: { user: { user: { is_staff?: boolean } | null } }) => {
  return {user: state.user.user};
};
wrapped = connect(mapStateToProps, null)(wrapped) as unknown as React.ComponentType<ContestControllerProps>;
export default wrapped as React.ComponentType<{
  showNav: boolean;
  setShowNav: (v: boolean) => void;
  ckey: string;
}>;

const btnStyle: React.CSSProperties = {
  height: "30px",
};
