import React from "react";
import { connect } from "react-redux";
import ReactPaginate from "react-paginate";
import { Link, Navigate } from "react-router";
import { Table, Row, Col, Button } from "react-bootstrap";

import { SpinLoader, ErrorBox } from "components";
import orgAPI from "api/organization";
import { setTitle } from "helpers/setTitle";
import { withParams } from "helpers/react-router";
import { toast } from "react-toastify";

import "styles/ClassicPagination.css";
import "./List.css";
import { FaDoorClosed, FaDoorOpen, FaGlobe, FaGreaterThan, FaLock, FaPlus, FaRegEye, FaRegEyeSlash, FaSignInAlt, FaTimes, FaUniversity, FaWrench } from "components/icons";


const ORG_PATH_IMG_SIZE = 25;

interface OrgShape {
  slug: string;
  name: string;
  short_name?: string;
  logo_url?: string;
  suborg_count: number;
  member_count?: number;
  is_open?: boolean;
  is_unlisted?: boolean;
  is_member?: boolean;
  is_protected?: boolean;
  access_code_prompt?: string;
  about?: string;
  creation_date?: string;
  admins?: { username: string; first_name?: string; last_name?: string; email?: string }[];
  [key: string]: unknown;
}

interface OrgItemProps {
  org: OrgShape;
  pushToPath?: (org: OrgShape) => void;
  onClick?: (e: React.MouseEvent) => void;
  ridx?: number;
  [key: string]: unknown;
}

class OrgItem extends React.Component<OrgItemProps> {
  render() {
    const { slug, name, logo_url, suborg_count, is_open, is_unlisted } = this.props.org;

    return (
      <tr className="org-list org-item">
        <td className="org-i h-100">
          <div className="org-img-wrapper">
            {logo_url ? (
              <img id="org-img" src={logo_url} alt={`${slug} logo`} />
            ) : (
              <FaUniversity size={40} />
            )}
          </div>
          <span className="org-slug">{slug}</span>
        </td>

        <td className="org-name-td">
          <div className="org-name-wrapper border-bottom m-2">
            <h6 className="org-name">{name}</h6>
          </div>

          <div className="org-about-wrapper w-100 d-inline-flex">
            <span className="org-tag">
              {is_open ? (
                <>
                  <FaDoorOpen size={18} />
                  <span className="d-none d-md-flex">Open</span>
                </>
              ) : (
                <>
                  <FaDoorClosed size={18} />
                  <span className="d-none d-md-flex">Private</span>
                </>
              )}
            </span>
            <span className="org-tag">
              {is_unlisted ? (
                <>
                  <FaRegEyeSlash size={18} />
                  <span className="d-none d-md-flex">Hidden</span>
                </>
              ) : (
                <>
                  <FaRegEye size={18} />
                  <span className="d-none d-md-flex">Public</span>
                </>
              )}
            </span>
            <span className="org-tag">
              <FaUniversity size={18} />
              <span>{suborg_count}</span>
            </span>
          </div>

          <div className="org-panel text-right">
            {this.props.org.suborg_count === 0 ? (
              <span className="text-secondary ml-2 mr-2">Browse</span>
            ) : (
              <Link
                to="#"
                className={`ml-2 mr-2`}
                onClick={() => this.props.pushToPath && this.props.pushToPath(this.props.org)}
              >
                Browse
              </Link>
            )}
            |
            <Link to="#" className="ml-2 mr-2" onClick={this.props.onClick}>
              Detail
            </Link>
          </div>
        </td>
      </tr>
    );
  }
}

interface OrgListProps {
  selectedOrg?: string | null;
  selectOrg?: (slug: string) => void;
  deselectOrg?: () => void;
  path: OrgShape[];
  pushToPath?: (org: OrgShape) => void;
  [key: string]: unknown;
}

interface OrgListState {
  loaded: boolean;
  errors: unknown;
  orgs: OrgShape[];
  count: number;
  currPage: number;
  pageCount: number;
  path: OrgShape[];
}

class OrgList extends React.Component<OrgListProps, OrgListState> {
  constructor(props: OrgListProps) {
    super(props);
    this.state = {
      loaded: false,
      errors: null,
      orgs: [],
      count: 0,
      currPage: 0,
      pageCount: 1,
      path: [],
    };
  }

  refetch(params = { page: 0 }) {
    this.setState({ loaded: false, errors: null });
    const slug =
      this.state.path.length === 0 ? null : this.state.path[this.state.path.length - 1].slug;

    orgAPI
      .getOrgs({ slug: slug as string | undefined, params: { page: params.page + 1 } })
      .then((res) => {
        this.setState({
          loaded: true,
          orgs: res.data.results,
          count: res.data.count,
          pageCount: res.data.total_pages,
          currPage: params.page,
        });
      })
      .catch((err: { response?: { data: unknown } }) => {
        this.setState({
          loaded: true,
          errors: err.response?.data || "Cannot fetch Organizations at the moment.",
        });
      });
  }

  componentDidMount() {
    this.refetch();
  }

  componentDidUpdate(_prevProps: OrgListProps, _prevState: OrgListState) {
    if (this.props.path !== this.state.path) {
      this.setState({ path: this.props.path }, () => {
        this.refetch();
      });
    }
  }

  handlePageClick = (event: { selected: number }) => {
    this.refetch({ page: event.selected });
  };

  render() {
    const { loaded, errors, orgs, count } = this.state;

    return (
      <div className="org-table">
        <div className="org-table-wrapper ml-1 mr-1 border-bottom">
          <ErrorBox errors={errors} />
          <Table responsive hover size="sm" striped bordered className="rounded">
            <tbody className="w-100">
              {!loaded ? (
                <tr style={{ height: "200px" }}>
                  <td colSpan={99}>
                    <SpinLoader margin="10px" />
                  </td>
                </tr>
              ) : (
                !errors && (
                  <>
                    {count > 0 ? (
                      orgs.map((org, ridx) => (
                        <OrgItem
                          org={org}
                          ridx={ridx}
                          key={`org${org.slug}`}
                          onClick={() => {
                            if (this.props.selectedOrg === org.slug && this.props.deselectOrg)
                              this.props.deselectOrg();
                            else if (this.props.selectOrg) this.props.selectOrg(org.slug);
                          }}
                        />
                      ))
                    ) : (
                      <tr style={{ height: "200px" }}>
                        <td colSpan={99}>
                          <em>No orgs are available yet.</em>
                        </td>
                      </tr>
                    )}
                  </>
                )
              )}
            </tbody>
          </Table>
        </div>
        {this.state.loaded === false ? (
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
              pageCount={this.state.pageCount}
              renderOnZeroPageCount={null}
              previousLabel={null}
              nextLabel={null}
            />
          </span>
        )}
      </div>
    );
  }
}

interface OrgDetailProps {
  slug?: string;
  deselectOrg?: () => void;
  user: {
    is_staff?: boolean;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
}

interface OrgDetailState {
  slug: string;
  loaded: boolean;
  errors: unknown;
  org: OrgShape | null;
  redirectUrl?: string;
}

class OrgDetail extends React.Component<OrgDetailProps, OrgDetailState> {
  constructor(props: OrgDetailProps) {
    super(props);
    this.state = {
      slug: this.props.slug || "",
      loaded: false,
      errors: null,
      org: null,
    };
  }

  fetch() {
    this.setState({ loaded: false, errors: null });
    orgAPI
      .getOrg({ slug: this.state.slug })
      .then((res) => {
        this.setState({ loaded: true, org: res.data });
      })
.catch((err: { response?: { data?: unknown } }) => {
        this.setState({ loaded: true, errors: err.response?.data });
      });
  }

  componentDidMount() {
    this.fetch();
  }

  componentDidUpdate(_prevProps: OrgDetailProps) {
    if (this.state.slug !== this.props.slug) {
      this.setState({ slug: this.props.slug || "" }, () => this.fetch());
    }
  }

  onJoinClick() {
    const { org, slug } = this.state;
    if (!org) return;
    if (org.is_protected) {
      const code = window.prompt(
        `Tổ chức này cần mã truy cập để gia nhập.\n` +
          (org.access_code_prompt ? `${org.access_code_prompt}\n` : "") +
          "Code:"
      );
      if (code === null) return;
      orgAPI
        .joinOrg({ slug, data: { access_code: code } })
        .then(() => {
          toast.success(`Welcome to ${slug}.`);
          this.fetch();
        })
.catch((err: { response?: { data?: { error?: string }; status?: number } }) => {
          if (err.response?.data?.error) toast.error(`${err.response.data.error}`);
          else toast.error(`Cannot join. (${err.response?.status})`);
        });
    } else {
      const conf = window.confirm(`Gia nhập tổ chức ${slug}?`);
      if (!conf) return;

      orgAPI
        .joinOrg({ slug } as never)
        .then(() => {
          toast.success(`Welcome to ${slug}.`);
          this.fetch();
        })
.catch((err: { response?: { data?: { error?: string }; status?: number } }) => {
          if (err.response?.data?.error) toast.error(`${err.response.data.error}`);
          else toast.error(`Cannot join. (${err.response?.status})`);
        });
    }
  }

  onLeaveClick() {
    const { slug } = this.state;
    const conf = window.confirm(`Rời khỏi tổ chức ${slug}?`);
    if (!conf) return;

    orgAPI
      .leaveOrg({ slug })
      .then(() => {
        toast.success(`Đã rời khỏi ${slug}.`);
        this.fetch();
      })
      .catch((err: { response?: { data?: { error?: string }; status?: number } }) => {
        if (err.response?.data?.error) toast.error(`${err.response.data.error}`);
        else toast.error(`Cannot leave. (${err.response?.status})`);
      });
  }

  render() {
    if (this.state.redirectUrl) return <Navigate to={`${this.state.redirectUrl}`} />;

    const { slug, loaded, errors, org } = this.state;
    const { user } = this.props;

    const isLoggedIn = user !== null;
    const isStaff = isLoggedIn && !!user?.is_staff;

    return (
      <div className="org-detail-wrapper border" style={{ position: "relative" }}>
        <div style={{ position: "absolute", right: 5, top: 5, width: "30px" }}>
          <Button
            className="btn-svg"
            variant="secondary"
            size="sm"
            onClick={() => this.props.deselectOrg && this.props.deselectOrg()}
          >
            {" "}
            <FaTimes />{" "}
          </Button>
          {isStaff && (
            <Button
              className="btn-svg"
              variant="danger"
              size="sm"
              onClick={() => this.setState({ redirectUrl: `/admin/org/${slug}/` })}
            >
              {" "}
              <FaWrench />{" "}
            </Button>
          )}
        </div>
        {!loaded && (
          <div className="flex-center-col">
            <SpinLoader margin="0" size={50} />
          </div>
        )}
        {loaded && !!errors && (
          <>
            <ErrorBox errors={errors} />
          </>
        )}
        {loaded && !errors && org && (
          <>
            <span className="d-flex justify-content-center align-items-center">
              {org.logo_url ? (
                <img
                  className="org-path-item-img"
                  src={org.logo_url}
                  alt={`${org.slug} logo`}
                  height={ORG_PATH_IMG_SIZE}
                />
              ) : (
                <FaUniversity size={ORG_PATH_IMG_SIZE} />
              )}
              <h5 className="m-0 p-2 org-detail-title">{org.short_name}</h5>
            </span>

            {isLoggedIn && (
              <span>
                <code>
                  You are {!org.is_member && "not"} a member of this organization.
                </code>
              </span>
            )}

            <div className="org-detail-item border">
              <h6 className="m-0">
                {" "}
                <code>{org.slug}</code> | {org.short_name}
              </h6>
              <h6 className="mb-1">{org.name}</h6>
              <span className="float-right" style={{ fontSize: "12px" }}>
                <em>Created {new Date(String(org.creation_date)).toLocaleString()}</em>
              </span>
            </div>

            <div className="org-detail-item border">
              <h6 className="m-0">About</h6>
              {String(org.about ?? "")}
            </div>

            <div className="org-detail-item border d-flex justify-content-around">
              <div> {org.suborg_count} org(s) </div>
              <div> {org.member_count} member(s) </div>
            </div>

            <div className="org-detail-item border">
              <h6 className="m-0">Organization Admins</h6>
              {org.admins && org.admins.length === 0 ? (
                <div style={{ height: "50px" }} className="flex-center">
                  <em>Currently there is no one.</em>
                </div>
              ) : (
                <ul className="m-0">
                  {(org.admins || []).map((admin) => (
                    <li key={`org-detail-admin-${admin.username}`}>
                      User <code>{admin.username}</code>
                      <ul>
                        <li>
                          <strong>Name</strong>: {admin.first_name} {admin.last_name}
                        </li>
                        <li>
                          <strong>Email</strong>: <code>{admin.email}</code>
                        </li>
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="org-detail-item border d-flex justify-content-around">
              {isLoggedIn ? (
                org.is_member ? (
                  <Button
                    size="sm"
                    className="btn-svg"
                    variant="danger"
                    onClick={() => this.onLeaveClick()}
                  >
                    Leave <FaTimes />
                  </Button>
                ) : org.is_open ? (
                  <Button
                    size="sm"
                    className="btn-svg"
                    variant={org.is_protected ? "warning" : "primary"}
                    onClick={() => this.onJoinClick()}
                  >
                    Join {org.is_protected ? <FaLock /> : <FaPlus />}
                  </Button>
                ) : (
                  <strong>This organization is private.</strong>
                )
              ) : (
                <Button
                  className="btn-svg"
                  size="sm"
                  variant="secondary"
                  onClick={() => this.setState({ redirectUrl: "/sign-in" })}
                >
                  Sign In to Join <FaSignInAlt size={12} />
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }
}

interface OrgMainProps {
  [key: string]: unknown;
}

interface OrgMainState {
  selectedOrg: string | null;
  path: OrgShape[];
  errors: unknown;
}

class OrgMain extends React.Component<OrgMainProps, OrgMainState> {
  constructor(props: OrgMainProps) {
    super(props);
    this.state = {
      selectedOrg: null,
      path: [],
      errors: null,
    };
  }

  selectOrg(slug: string) {
    this.setState({ selectedOrg: slug });
  }

  deselectOrg() {
    this.setState({ selectedOrg: null });
  }

  componentDidMount() {
    setTitle("Organizations");
  }

  render() {
    const { path, selectedOrg, errors } = this.state;

    return (
      <div className="wrapper-vanilla" id="org-main">
        <Row id="org-title-div">
          <Col md={3} className="flex-center-col">
            <h4 className="pl-2 pr-2 m-0">Organization</h4>
          </Col>
          <Col className="org-path" style={{ width: "100%", height: "100%", overflow: "hidden" }}>
            <div
              style={{
                width: "100%",
                height: "100%",
                overflowX: "auto",
                boxSizing: "content-box",
              }}
              className="d-flex"
            >
              <div className="org-path-item">
                <Link to="#" onClick={() => this.setState({ path: [] })} className="text-dark">
                  <FaGlobe size={ORG_PATH_IMG_SIZE} />
                </Link>
              </div>

              {path.map((org, idx) => {
                return (
                  <React.Fragment key={`org-path-item-${org.slug}`}>
                    <div className="org-path-divider">
                      <div className="flex-center-col">
                        <FaGreaterThan />
                      </div>
                    </div>
                    <div className="org-path-item">
                      <Link
                        className="d-inline-flex justify-content-center align-items-center text-dark"
                        to="#"
                        onClick={() => {
                          this.setState({ path: path.slice(0, idx + 1) });
                        }}
                      >
                        {org.logo_url ? (
                          <img
                            className="org-path-item-img"
                            src={org.logo_url}
                            alt={`${org.slug} logo`}
                            height={ORG_PATH_IMG_SIZE}
                          />
                        ) : (
                          <FaUniversity size={ORG_PATH_IMG_SIZE} />
                        )}
                        <div className="org-path-item-slug text-truncate"> {org.slug} </div>
                      </Link>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </Col>
        </Row>

        {!!errors && (
          <div className="error-box-wrapper m-2">
            <ErrorBox errors={errors} />
          </div>
        )}

        <Row>
          <Col className="org-table-wrapper-col ml-1 mr-1" md={selectedOrg ? 6 : 12}>
            <OrgList
              orgs={this.props.orgs}
              selectedOrg={selectedOrg}
              selectOrg={(slug) => this.selectOrg(slug)}
              deselectOrg={() => this.deselectOrg()}
              path={path}
              pushToPath={(newOrg) => {
                this.setState({ path: path.concat(newOrg) });
              }}
            />
          </Col>
          {selectedOrg && (
            <Col className="org-detail-wrapper-col mr-1 mb-1">
              <OrgDetail
                user={this.props.user as OrgDetailProps["user"]}
                slug={selectedOrg}
                deselectOrg={() => this.deselectOrg()}
              />
            </Col>
          )}
        </Row>
      </div>
    );
  }
}

let WrappedPD = OrgMain as React.ComponentType<any>;
WrappedPD = withParams(WrappedPD as never) as never;
const mapStateToProps = (state: { user: { user: unknown } }) => {
  return { user: state.user.user };
};
WrappedPD = connect(mapStateToProps, null)(WrappedPD) as unknown as React.ComponentType<any>;
export default WrappedPD;
