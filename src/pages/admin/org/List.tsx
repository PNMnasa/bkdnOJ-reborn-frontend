import React from "react";
import {toast} from "react-toastify";
import {Link, Navigate} from "react-router";
import {Button, Modal, Form} from "react-bootstrap";

import { AiOutlinePlusCircle, FaPlus, FaTimes } from "components/icons";


import {SpinLoader, ErrorBox} from "components";
import orgAPI from "api/organization";

import {setTitle} from "helpers/setTitle";


import "./List.css";
import "styles/ClassicPagination.css";

export const INITIAL_FILTER: Record<string, unknown> = {
  search: "",
  ordering: "-creation_date",
};

interface OrgData {
  slug: string;
  name: string;
  short_name: string;
  logo_url?: string;
  member_count?: number;
  real_member_count?: number;
  suborg_count?: number;
  is_unlisted?: boolean;
  sub_orgs?: OrgData[];
  [key: string]: unknown;
}

interface OrgListProps {
  orgs: OrgData[];
  prefix: string;
  setModalData: (slug: string) => void;
}

class OrgList extends React.Component<OrgListProps> {
  constructor(props: OrgListProps) {
    super(props);
  }
  render() {
    const {orgs, prefix} = this.props;
    if (orgs.length === 0) return <></>;

    return (
      <div className="org-item-wrapper text-left m-2">
        {orgs.map((org, idx) => (
          <div className="org-item mt-1 mb-1 border" key={`org-${org.slug}`}>
            <div className="text-left ml-1">
              <p className="m-0">
                <strong>{`${prefix}${idx + 1}. ${org.slug}`}</strong>:
                <sub>
                  {" "}
                  (Total Members: {org.member_count}, Actual Members:{" "}
                  {org.real_member_count}, Suborgs: {org.suborg_count}){" "}
                </sub>
              </p>
              <div className="d-flex ml-2">
                <div
                  style={{
                    maxHeight: "50px",
                    minHeight: "50px",
                    maxWidth: "50px",
                    minWidth: "50px",
                  }}
                  className="text-center border"
                >
                  {org.logo_url ? (
                    <img
                      style={{maxHeight: "100%", maxWidth: "100%"}}
                      src={org.logo_url}
                    />
                  ) : (
                    <>No Img</>
                  )}
                </div>
                <p className="m-0 ml-2">
                  <strong>Name</strong>: {org.name}
                  <br></br>
                  <strong>Short Name</strong>: {org.short_name}
                  <br></br>
                  <strong>Hiển thị lên web?</strong>:{" "}
                  {org.is_unlisted ? "Không" : "Có"}
                  <br></br>
                  <Link to={`/admin/org/${org.slug}`}>{`>> Detail`}</Link>
                  <Link
                    className="pl-3"
                    to="#"
                    onClick={() => this.props.setModalData(org.slug)}
                  >{`+ Add Sub Org`}</Link>
                </p>
              </div>
            </div>
            <OrgList
              orgs={org.sub_orgs || []}
              prefix={prefix + `${idx + 1}.`}
              setModalData={this.props.setModalData}
            />
          </div>
        ))}
      </div>
    );
  }
}

interface OrgListWrapperState {
  searchData: Record<string, unknown>;
  submitting: boolean;
  loaded: boolean;
  errors: string[] | null;
  modalData: {
    show: boolean;
    parentOrg: string | null;
  };
  redirectUrl: string | null;
  memberOf?: OrgData[];
  adminOf?: OrgData[];
}

class OrgListWrapper extends React.Component<Record<string, never>, OrgListWrapperState> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      searchData: {...INITIAL_FILTER},

      submitting: false,
      loaded: false,
      errors: null,

      modalData: {
        show: false,
        parentOrg: null,
      },

      redirectUrl: null,
    };
    setTitle("Admin | Orgs");
  }

  closeNewModal() {
    this.setState({
      modalData: {
        show: false,
        parentOrg: null,
      },
    });
  }
  openNewModal(slug: string | null) {
    this.setState({
      modalData: {
        show: true,
        parentOrg: slug,
      },
    });
  }

  callApi() {
    this.setState({loaded: false, errors: null});

    orgAPI
      .getMyOrgs()
      .then(res => {
        this.setState({
          memberOf: res.data.member_of,
          adminOf: res.data.admin_of,
          loaded: true,
        });
      })
      .catch((_err: unknown) => {
        this.setState({
          loaded: true,
          errors: ["Cannot fetch orgs. Please retry again."],
        });
      });
  }

  componentDidMount() {
    this.callApi();
  }

  render() {
    if (this.state.redirectUrl)
      return <Navigate to={`${this.state.redirectUrl}`} />;

    const {adminOf, loaded, errors, submitting} = this.state;

    return (
      <div className="admin admin-org">
        <NewModal
          show={this.state.modalData.show}
          parent={this.state.modalData.parentOrg}
          setHide={() => this.closeNewModal()}
        />
        <div className="admin-options wrapper-vanilla m-0 mb-1">
          <div className="border d-inline-flex p-1">
            <Button
              size="sm"
              style={{minHeight: "30px"}}
              variant="dark"
              className="btn-svg"
              disabled={submitting}
              onClick={() => this.openNewModal(null)}
            >
              <AiOutlinePlusCircle /> Add Root Org (Form)
            </Button>
          </div>

          <div className="flex-center">
            <div className="admin-note text-center">
              {submitting && (
                <span className="loading_3dot">Đang xử lý yêu cầu</span>
              )}
            </div>
          </div>
        </div>

        <div className="admin-table org-table wrapper-vanilla">
          <h4>
            <strong>You are Admin of these Organizations</strong>
          </h4>
          <ErrorBox errors={errors} />
          {!loaded && (
            <>
              <div className="m-3 flex-center-col" style={{minHeight: "200px"}}>
                <SpinLoader size={30} margin="10px" />
                <span>
                  <em>
                    Hệ thống đang tải tất cả nhóm mà bạn là Admin. Thao tác này
                    lần đầu có thể lâu nếu bạn có quá nhiều tổ chức.
                  </em>
                </span>
              </div>
            </>
          )}
          {loaded && !errors && (
            <>
              {
                <OrgList
                  orgs={adminOf || []}
                  prefix={""}
                  setModalData={slug => this.openNewModal(slug)}
                />
              }
              {(adminOf || []).length === 0 && (
                <div style={{height: "100px"}} className="flex-center">
                  <em>Bạn hiện đang không là admin của tổ chức nào cả.</em>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
}

export default OrgListWrapper;

interface NewModalProps {
  show: boolean;
  parent: string | null;
  setHide: () => void;
}

interface NewModalState {
  parent: string | null;
  slug: string;
  short_name: string;
  name: string;
  errors: { errors: unknown } | null;
  redirectUrl: string | null;
}

class NewModal extends React.Component<NewModalProps, NewModalState> {
  constructor(props: NewModalProps) {
    super(props);
    this.state = {
      parent: this.props.parent,

      slug: "",
      short_name: "",
      name: "",

      errors: null,
      redirectUrl: null,
    };
  }

  onSubmitHandler(e: React.FormEvent) {
    e.preventDefault();
    this.setState({errors: null});

    const parent = this.props.parent;
    const data = {
      slug: this.state.slug,
      name: this.state.name,
      short_name: this.state.short_name,
    };
    const endpoint = parent
      ? orgAPI.createSubOrg({parentSlug: parent, data})
      : orgAPI.createOrg(data);

    endpoint
      .then(() => {
        toast.success("OK Created.");
        this.setState({
          redirectUrl: `/admin/org/${this.state.slug}`,
        });
      })
      .catch((err: { response?: { status: number; data: unknown } }) => {
        toast.error(`Cannot create org. (${err.response?.status})`);
        this.setState({errors: {errors: err.response?.data}});
      });
  }
  componentWillUnmount() {}

  render() {
    const parent = this.props.parent;
    if (this.state.redirectUrl) return <Navigate to={this.state.redirectUrl} />;

    return (
      <Modal
        show={this.props.show}
        onHide={() => {
          this.setState({errors: null});
          this.props.setHide();
        }}
      >
        <Modal.Header>
          <Modal.Title>+ Thêm tổ chức</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ErrorBox errors={this.state.errors} />
          <p>
            Bạn đang thêm tổ chức{" "}
            {parent ? `con cho tổ chức ${parent}.` : "root của toàn hệ thống."}
          </p>

          <label className="required mb-0 mt-2"> Slug: </label>
          <Form.Control
            size="sm"
            type="text"
            placeholder="Mã định danh cho tổ chức"
            id="new-org-slug"
            value={this.state.slug}
            onChange={e => this.setState({slug: e.target.value})}
            required
          />
          <label className="required mb-0 mt-2"> Short name: </label>
          <Form.Control
            size="sm"
            type="text"
            placeholder="Tên ngắn của tổ chức, dùng để hiển thị trên scoreboard."
            id="new-org-slug"
            value={this.state.short_name}
            onChange={e => this.setState({short_name: e.target.value})}
            required
          />
          <label className="required mb-0 mt-2"> Name: </label>
          <Form.Control
            size="sm"
            type="text"
            placeholder="Tên dài của tổ chức."
            id="new-org-slug"
            value={this.state.name}
            onChange={e => this.setState({name: e.target.value})}
            required
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            className="btn-svg"
            onClick={() => {
              this.setState({errors: null});
              this.props.setHide();
            }}
          >
            <FaTimes /> Hủy
          </Button>
          <Button
            variant="dark"
            className="btn-svg"
            onClick={e => this.onSubmitHandler(e)}
          >
            <FaPlus /> Tạo
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
