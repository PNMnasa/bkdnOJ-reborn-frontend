import React from "react";
import { Modal, Button } from "react-bootstrap";

import { connect } from "react-redux";

import { updateMyOrg, updateSelectedOrg } from "redux/MyOrg/actions";

import orgAPI from "api/organization";

import DropdownTreeSelect from "components/DropdownTreeNoRerender";
import "react-dropdown-tree-select/dist/styles.css";

interface OrgNode {
  slug?: string | null;
  short_name?: string;
  name?: string;
  sub_orgs?: OrgNode[];
  [key: string]: unknown;
}

const getDropdownTreeSelectData = (orgs: OrgNode[], selectedOrgSlug: string | null = null) => {
  let list: Record<string, unknown>[] = [];
  orgs.forEach((org) => {
    let mutable: Record<string, unknown> = { ...org };
    mutable.label = org.short_name;
    mutable.tagLabel = org.slug;
    if (mutable.slug === selectedOrgSlug) mutable.checked = true;

    let childData = getDropdownTreeSelectData(org.sub_orgs || [], selectedOrgSlug);
    mutable.children = childData;

    list.push(mutable);
  });
  return list;
};

interface SwitchOrgModalProps {
  show: boolean;
  setShow: (b: boolean) => void;
  myOrg: { memberOf: OrgNode[]; adminOf: OrgNode[] };
  selectedOrg: { slug?: string | null };
  updateSelectedOrg: (org: OrgNode) => void;
  updateMyOrg: (data: { memberOf: OrgNode[]; adminOf: OrgNode[] }) => void;
}

interface SwitchOrgModalState {
  loaded: boolean;
  selectedOrg: OrgNode;
  data: Record<string, unknown>[];
}

class SwitchOrgModal extends React.Component<SwitchOrgModalProps, SwitchOrgModalState> {
  constructor(props: SwitchOrgModalProps) {
    super(props);
    this.state = {
      loaded: false,
      selectedOrg: {},
      data: [],
    };
  }

  refetch() {
    orgAPI
      .getMyOrgs()
      .then((res) => {
        this.props.updateMyOrg({
          adminOf: res.data.admin_of,
          memberOf: res.data.member_of,
        });
      })
      .catch(() => {});
  }

  componentDidMount() {
    this.refetch();
  }

  componentDidUpdate(prevProps: SwitchOrgModalProps, prevState: SwitchOrgModalState) {
    if (prevState.selectedOrg !== this.state.selectedOrg) {
      this.props.updateSelectedOrg(this.state.selectedOrg);
    }

    if (
      prevProps.myOrg !== this.props.myOrg ||
      prevProps.selectedOrg !== this.props.selectedOrg
    ) {
      let selectedOrgSlug = this.props.selectedOrg.slug;
      this.setState({
        data: [
          ...getDropdownTreeSelectData(this.props.myOrg.memberOf, selectedOrgSlug || null),
        ],
      });
    }

    if (prevProps.show !== this.props.show && this.props.show === true) {
      this.refetch();
    }
  }

  onChangeHandler(currNode: unknown, selNodes: OrgNode[]) {
    if (selNodes.length > 0) {
      const org = {
        short_name: selNodes[0].short_name,
        name: selNodes[0].name,
        slug: selNodes[0].slug,
      };
      this.setState({ selectedOrg: org });
    } else {
      this.setState({ selectedOrg: {} });
    }
  }

  render() {
    const { show, setShow } = this.props;

    return (
      <Modal show={show} onHide={() => setShow(false)} aria-labelledby="switch-org-modal">
        <Modal.Header>
          <Modal.Title id="switch-org-modal">Filter by Organization</Modal.Title>
        </Modal.Header>
        <Modal.Body className="flex-center-col">
          <p>Bạn đang xem với tư cách là thành viên của:</p>

          <DropdownTreeSelect
            data={this.state.data}
            mode="radioSelect"
            onChange={(a, b) => this.onChangeHandler(a, b)}
          />

          <em>
            Đổi thiết lập bên trên cho phép lọc các tài nguyên mà chỉ được chia sẻ riêng cho tổ chức đó.
          </em>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = (state: {
  myOrg: { memberOf: OrgNode[]; adminOf: OrgNode[]; selectedOrg: { slug?: string | null } };
}) => {
  return {
    myOrg: state.myOrg,
    selectedOrg: state.myOrg.selectedOrg,
  };
};

const mapDispatchToProps = (dispatch: (action: unknown) => void) => {
  return {
    updateSelectedOrg: (org: OrgNode) => dispatch(updateSelectedOrg({ selectedOrg: org })),
    updateMyOrg: ({ memberOf, adminOf, selectedOrg }: { memberOf: OrgNode[]; adminOf: OrgNode[]; selectedOrg?: OrgNode }) =>
      dispatch(updateMyOrg({ memberOf, adminOf, selectedOrg })),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SwitchOrgModal);