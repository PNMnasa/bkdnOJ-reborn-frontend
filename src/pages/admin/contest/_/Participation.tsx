import React from "react";
import { toast } from "react-toastify";
import {Form, Row, Col, Table, Button, Modal} from "react-bootstrap";
import ReactPaginate from "react-paginate";

import { FaFilter, FaPlusCircle, FaRegSave, FaTimes, FaUniversity } from "components/icons";


import {getLocalDateWithTimezone} from "helpers/dateFormatter";
import {qmClarify} from "helpers/components";

import {SpinLoader, ErrorBox} from "components";
import OrgSingleSelect from "components/SelectSingle/Org";
import OrgMultiSelectRaw from "components/SelectMulti/Org";

const OrgMultiSelect = OrgMultiSelectRaw as React.ComponentType<any>;
import contestAPI from "api/contest";
import "./Participation.css";
import "styles/ClassicPagination.css";

interface FiltersProps {
  value?: Record<string, unknown>;
  onChange?: (data: Record<string, unknown>) => void;
  setFilters: (filters: Record<string, unknown>) => void;
  disabled?: boolean;
}

interface FiltersState {
  filters: Record<string, unknown>;
  filterByTypeChk?: boolean;
  filterByOrgChk?: boolean;
  filterByOrgNoneOrg?: boolean;
  filterByOrgNoneOrgChk?: boolean;
  filterBySearchChk?: boolean;
  selectedOrgs?: unknown[];
}

class Filters extends React.Component<FiltersProps, FiltersState> {
  constructor (props: FiltersProps) {
    super(props);
    this.state = {
      filters: {},
    }
  }

  setFilters() {
    var filters: Record<string, unknown> = {}
    const state = this.state;
    if (state.filterByTypeChk) filters.virtual = state.filters.virtual;
    if (state.filterByOrgChk) {
      filters.organizations = state.filters.organizations || [];
      if (state.filterByOrgNoneOrg) (filters.organizations as unknown[]).push('');
    }
    if (state.filterBySearchChk) filters.search = state.filters.search;
    this.props.setFilters(filters)
  }

  resetFilters() {
    this.setState({
      filterByTypeChk: false,
      filterByOrgChk: false,
      filterByOrgNoneOrgChk: false,
      filterBySearchChk: false,
      filters: {},
    })
  }

  render() {
    const {filters} = this.state;

    return (
      <div className="participation-filters">
        <strong>Filters:</strong>
        <div className="options border p-1">
          <Row className="m-0 mb-2 mt-2">
            <Col className="" xl={12}>
              <span className="flex-center">
                <input type="checkbox" id="part-filter-type-chk" className="mr-1"
                  checked={this.state.filterByTypeChk}
                  onChange={e => this.setState({filterByTypeChk : e.target.checked })}
                /> 
                <label htmlFor="part-filter-type-chk">Filter by Type</label>
                {qmClarify("Chỉ có tác dụng nếu được check. "+
                            "Disable muốn truy vấn tất cả type. ")}
              </span>
            </Col>
            <Col className="ml-2">
              {VIRTUAL_TYPE.map(type => (
                <div key={`part-${type}`} className="d-inline">
                  <Form.Check
                    inline
                    name="participation-type"
                    type="radio"
                    disabled={!this.state.filterByTypeChk}
                    id={`${type}`}
                    label={`${type}`}
                    checked={type === filters.virtual}
                    onChange={e => this.setState({
                      filters: {
                        ...filters,
                        virtual: e.target.id,
                      },
                    })}
                  />
                </div>
              ))}
            </Col>
          </Row>

          <Row className="flex-center m-0 mb-2">
            <Col className="d-inline-flex" lg={12}>
              <span className="flex-center">
                <input type="checkbox" id="part-filter-org-chk" className="mr-1"
                  checked={this.state.filterByOrgChk}
                  onChange={e => this.setState({filterByOrgChk : e.target.checked })}
                /> 
                <label htmlFor="part-filter-org-chk">Filter by Orgs</label>
                {qmClarify("Chỉ có tác dụng nếu được check. "+
                            "Truy vấn tất cả lượt tham dự có org trong list. "+
                            "Check `Include None` để truy vấn các lượt không có org.")}
              </span>
            </Col>
            <Col className="ml-2 d-block">
              <span className="d-block">
                <input type="checkbox" id="part-filter-org-none" disabled={!this.state.filterByOrgChk}
                  onChange={e => this.setState({ filterByOrgNoneOrg: e.target.checked })}
                />
                <label htmlFor="part-filter-org-none" className="ml-1">Include None</label>
              </span>
              <OrgMultiSelect isDisabled={!this.state.filterByOrgChk}
                onChange={(sel: {slug: string}[]) => {
                  this.setState({
                    selectedOrgs: sel,
                    filters: {
                      ...filters,
                      organizations: sel.map(org => org.slug),
                    }
                  })
                }}
                value={this.state.selectedOrgs}
              />
            </Col>
          </Row>

          <Row className="flex-center m-0 mb-2">
            <Col className="d-inline-flex" lg={12}>
              <span className="flex-center">
                <input type="checkbox" id="part-filter-search-chk" className="mr-1"
                  checked={this.state.filterBySearchChk}
                  onChange={e => this.setState({filterBySearchChk : e.target.checked })}
                /> 
                <label htmlFor="part-filter-search-chk">Search</label>
                {qmClarify("Chỉ có tác dụng nếu được check. "+
                            "Tìm theo username:\n  'tester' để tìm 'tester1', 'tester12',...")}
              </span>
            </Col>
            <Col className="ml-2 d-inline-flex">
              <input type="text" className="w-100" disabled={!this.state.filterBySearchChk }
                      placeholder="Search prefix username.."
                      value={(this.state.filters.search as string) || ""}
                      onChange={e => this.setState({
                        filters: {
                          ...filters,
                          search: e.target.value, 
                        }
                      })}
              ></input>
            </Col>
          </Row>

          <div className="d-inline-flex flex-row-reverse w-100">
            <Button
              size="sm"
              variant="dark"
              className="ml-1 mr-1 btn-svg"
              onClick={() => this.setFilters()}
              disabled={this.props.disabled}
            >
              {this.props.disabled ? <SpinLoader margin="0" size={16}/> : <FaFilter/>}
               Filter
            </Button>
            <Button
              size="sm"
              variant="light"
              className="ml-1 mr-1 btn-svg"
              onClick={() => this.resetFilters()}
            >
              <FaTimes/> Reset
            </Button>
          </div>
        </div>
      </div>
    )
  }
}

const INITIAL_STATE: Record<string, unknown> = {
  participations: [],
  count: null,
  currPage: 0,
  pageCount: 1,
  // bools
  loaded: false,
  errors: null,
  // params
  virtual: null,
  // modal
  selectChk: [],
};
const VIRTUAL_TYPE = ["LIVE", "SPECTATE"];

interface ParticipationProps {
  ckey: string;
}

interface ParticipationItem {
  id: number;
  user: {
    username: string;
    first_name: string;
    last_name: string;
    display_name?: string;
    avatar: string;
  };
  real_start: string;
  virtual: string;
  organization?: {
    slug: string;
    name: string;
    logo_url?: string;
  };
  is_disqualified: boolean;
  [key: string]: unknown;
}

interface ParticipationState {
  participations: ParticipationItem[];
  count: number | null;
  currPage: number;
  pageCount: number;
  loaded: boolean;
  errors: unknown;
  virtual: string | null;
  selectChk: boolean[];
  filters: Record<string, unknown>;
  addParticipationModalShow: boolean;
  setOrganizationModalShow: boolean;
}

class Participation extends React.Component<ParticipationProps, ParticipationState> {
  private ckey: string;

  constructor(props: ParticipationProps) {
    super(props);
    this.ckey = this.props.ckey;
    this.state = {
      ...(INITIAL_STATE as unknown as ParticipationState),
      filters: {},
      addParticipationModalShow: false,
      setOrganizationModalShow: false,
    };
  }
  openAddParticipationModal() {
    this.setState({addParticipationModalShow: true});
  }
  closeAddParticipationModal() {
    this.setState({addParticipationModalShow: false});
  }
  openSetOrganizationModal() {
    this.setState({setOrganizationModalShow: true});
  }
  closeSetOrganizationModal() {
    this.setState({setOrganizationModalShow: false});
  }

  resetFetch() {
    this.setState({...INITIAL_STATE} as unknown as ParticipationState, () => this.refetch());
  }

  refetch(params = {page: 0}) {
    this.setState({loaded: false, errors: null});
    let prms = {
      page: params.page + 1,
      ...this.state.filters
    };

    contestAPI
      .getContestParticipations({key: this.ckey, params: prms})
      .then(res => {
        this.setState({
          participations: res.data.results,
          count: res.data.count,
          pageCount: res.data.total_pages,
          currPage: params.page,

          selectChk: Array(res.data.results.length).fill(false),
          loaded: true,
        });
      })
      .catch((_err: unknown) => {
        this.setState({
          loaded: true,
          errors: ["Cannot fetch Participations for this contest."],
        });
      });
  }

  handlePageClick = (event: {selected: number}) => {
    this.refetch({page: event.selected});
  };

  setErrors(errData: unknown) {
    this.setState({ errors: errData })
  }

  componentDidMount() {
    this.refetch();
  }
  componentDidUpdate(_prevProps: ParticipationProps, prevState: ParticipationState) {
    if (prevState.filters !== this.state.filters) this.refetch()
  }

  genMessageActOnParticipations(action: string, params: Record<string, unknown>, affected: unknown[]) {
    let stringified = JSON.stringify(affected);
    if (stringified.length > 255) {
      stringified = stringified.substring(0, 255-4)+"...]"
    }
    if (action === 'delete') {
      return "Bạn đang xóa các lượt tham dự:\n"+
        `${stringified}`+"\nBạn có muốn tiếp tục?"
    } else
    if (action === 'disqualify') {
      return "Bạn đang hủy tư cách thi đấu (disqualify) của các lượt tham dự:\n"+
        `${stringified}`+"\nBạn có muốn tiếp tục?"
    } else 
    if (action === 'undisqualify') {
      return "Bạn muốn khôi phục tư cách thi đấu (undisqualify) của các lượt tham dự:\n"+
        `${stringified}`+"\nBạn có muốn tiếp tục?"
    } else 
    if (action === 'set-org') {
      return `Bạn muốn đặt org='${params.organization}' cho các lượt tham dự sau:`+
        `${stringified}`+"\nBạn có muốn tiếp tục?"
    }
    return `Unrecognized action '${action}'`
  }

  actOnParticipations(action: string, params?: Record<string, unknown>) {
    let partIds: number[] = [], partUsers: string[] = []
    this.state.participations.map( (p, i) => {
      if (this.state.selectChk[i]) {
        partIds.push(p.id);
        partUsers.push(p.user.username)
      }
    })
    
    if (partIds.length === 0) {
      alert("Không có lượt đăng ký nào đang được chọn.")
      return;
    }
    const conf = window.confirm(this.genMessageActOnParticipations(
      action, params || {}, partUsers,
    ))
    if (!conf) return;

    const data = {
      action: action.toLowerCase(),
      data: {
        participations: partIds,
        ...params,
      }
    }

    const apiCall = contestAPI.actContestParticipation({
      key: this.ckey, data,
    });
    const parent = this;

    toast.promise(apiCall, {
      pending: {
        render() { return "Processing..."; },
      },
      success: {
        render() { parent.refetch(); return "Success."; },
      },
      error: {
        render(data: any) {
          parent.setErrors(data.data?.response?.data);
          return "Update Failed.";
        },
      },
    })
  }

  render() {
    const {participations} = this.state;
    return (
      <div className="contest-participation-wrapper">
        <div className="table-wrapper m-2">
          <Filters 
            value={this.state.filters}
            onChange={data => this.setState({ filters: data })} 
            setFilters={filters => this.setState({filters})}
            disabled={!this.state.loaded}
          />

          <div className="contest-participation-options-wrapper border p-1 mb-1 mt-1">
           <strong>Actions</strong>
            {qmClarify("Actions sẽ tác động những lượt tham dự được select. Select chúng bằng checkbox bên phải ở table bên dưới.")}
            <div className="contest-participation-options">
              <span className="ml-1 mr-1">
                <Button size="sm" variant="warning"
                  onClick={()=>this.openSetOrganizationModal()}
                >Change Org</Button>
              </span>
              <span className="ml-1 mr-1">
                <Button size="sm" variant="warning"
                  onClick={()=>this.actOnParticipations('disqualify')}
                >Disqualify</Button>
                <Button size="sm" variant="success"
                  onClick={()=>this.actOnParticipations('undisqualify')}
                >Undisqualify</Button>
              </span>
              <span className="ml-1 mr-1">
                <Button size="sm" variant="danger"
                  onClick={()=>this.actOnParticipations('delete')}
                >Delete</Button>
              </span>
            </div>

            <ErrorBox errors={this.state.errors}/>

            <div className="admin-table contest-participation-table mt-1">
              <h4 className="contest-participation-lbl m-0">Participations</h4>
              <div className="part-add-btn">
                <Button
                  size="sm"
                  variant="dark"
                  style={{width: "100%"}}
                  className="btn-svg"
                  onClick={() => this.openAddParticipationModal()}
                >
                  <FaPlusCircle /> Add
                </Button>
              </div>
              <Table
                responsive
                hover
                size="sm"
                striped
                bordered
                className="rounded mb-0"
              >
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User</th>
                    <th>When</th>
                    <th>
                      Type
                      {qmClarify(
                        "Hình thức tham dự của thí sinh. \n* -1 -> SPECTATE, chỉ theo dõi, kết quả không được tính\n" +
                          "* 0 -> LIVE, thí sinh tham dự chính thức\n* khác -> VIRTUAL, thí sinh tham dự không chính " +
                          "thức, sau khi contest đã kết thúc."
                      )}
                    </th>
                    <th>
                      Org
                    </th>
                    <th>
                      Disqualified
                      {qmClarify(
                        "Những lần tham dự bị Disqualified này sẽ mang điểm là -9999 trên bảng xếp hạng. " +
                          "Nếu lượt tham dự này là LIVE, thí sinh này sẽ không được xếp hạng Rating."
                      )}
                    </th>
                    <th>
                      <input type="checkbox"
                        onChange={e => {
                          const arrLeng = this.state.selectChk.length
                          this.setState({
                            selectChk: Array(arrLeng).fill(e.target.checked)
                          })
                        }}
                      ></input>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {participations.length === 0 &&
                    <tr><td colSpan={99}><span><em>
                      No participations
                    </em></span></td></tr>
                  }
                  {participations.map((part, ridx) => {
                    let name: string | null = `${part.user.first_name} ${part.user.last_name}`
                    if (name.length === 1) name = null;

                    return (
                      <tr key={`ct-part-${part.id}`}>
                        <td>{part.id}</td>
                        <td>
                          <div className="flex-center justify-content-start">
                            <img src={part.user.avatar} className="d-flex border" height={40} 
                              style={{ width: "auto" }}
                            /> 
                            <div className="ml-1 d-block text-left">
                              <div><strong>{part.user.username}</strong></div>
                              <em className="d-block" style={{fontSize: 10}}>{part.user.display_name || "**no display name"}</em>
                              <em className="d-block" style={{fontSize: 10}}>{name || "**no name"}</em>
                            </div>
                          </div>
                        </td>
                        <td>{getLocalDateWithTimezone(part.real_start)}</td>
                        <td>{part.virtual}</td>
                        <td>{
                          !part.organization ? "None" : 
                          <div className="flex-center">
                            {
                              part.organization.logo_url ? 
                              <img src={part.organization.logo_url||""} className="d-flex border" height={40} 
                                  style={{ width: "auto" }}
                              /> : <FaUniversity size={34}/>
                            }
                            <div className="ml-1 d-block text-left">
                              <div><strong>{part.organization.slug}</strong></div>
                              <div>{part.organization.name}</div>
                            </div>
                          </div>
                        }</td>
                        <td>{part.is_disqualified ? "Yes" : "No"}</td>
                        <td>
                          <input type="checkbox" 
                            checked={this.state.selectChk[ridx]}
                            onChange={() => {
                              const selectChk = this.state.selectChk;
                              this.setState({
                                selectChk: selectChk.map((v, i) => i === ridx ? !v : v)
                              })
                            }}
                          />
                        </td>
                      </tr>
                  )})
                }
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
        </div>
        <SetOrganizationModal
          ckey={this.ckey}
          modalShow={this.state.setOrganizationModalShow}
          closeModalHandler={() => this.closeSetOrganizationModal()}
          actOnParticipations={(act: string, data?: Record<string, unknown>)=>this.actOnParticipations(act, data)}
          refetch={() => this.refetch()}
        />
        <AddParticipationModal
          ckey={this.ckey}
          modalShow={this.state.addParticipationModalShow}
          closeModalHandler={() => this.closeAddParticipationModal()}
          refetch={() => this.refetch()}
        />
      </div>
    );
  }
}

interface SetOrganizationModalProps {
  ckey: string;
  modalShow: boolean;
  closeModalHandler: () => void;
  actOnParticipations: (act: string, data?: Record<string, unknown>) => void;
  refetch: () => void;
}

interface SetOrganizationModalState {
  selectedOrg: {slug: string} | null;
  submitting?: boolean;
  errors?: unknown;
}

class SetOrganizationModal extends React.Component<SetOrganizationModalProps, SetOrganizationModalState> {
  constructor(props: SetOrganizationModalProps) {
    super(props);
    this.state = {
      selectedOrg: null,
    }
  }

  closeModalHandler() {
    this.setState({submitting: false, errors: null});
    this.props.closeModalHandler();
  }

  render() {
    return (
      <Modal
        show={this.props.modalShow}
        onHide={() => this.closeModalHandler()}
      >
        <Modal.Header>
          <Modal.Title>Set Organization</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Lựa chọn tổ chức đến gán cho các lượt đăng ký:
          <OrgSingleSelect
            onChange={(sel: {slug: string}) => this.setState({selectedOrg: sel})}
            value={this.state.selectedOrg}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button 
            size="sm"
            variant="secondary" 
            className="btn-svg"
            onClick={() => this.closeModalHandler()}
          >
            <FaTimes/> Đóng
          </Button>
          <Button
            size="sm"
            variant="danger"
            className="btn-svg"
            onClick={() => {
              if (this.state.selectedOrg)
                this.props.actOnParticipations(
                  'set-org', 
                  {organization: this.state.selectedOrg.slug}
                );
              this.closeModalHandler();
            }}
          >
            <FaRegSave/> Lưu 
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

interface AddParticipationModalProps {
  ckey: string;
  modalShow: boolean;
  closeModalHandler: () => void;
  refetch: () => void;
}

interface AddParticipationModalState {
  addPartType: string | null;
  setOrgAuto: boolean;
  selectedOrg: {slug: string} | null;
  users: string;
  submitting: boolean;
  errors: unknown;
}

class AddParticipationModal extends React.Component<AddParticipationModalProps, AddParticipationModalState> {
  constructor(props: AddParticipationModalProps) {
    super(props);
    this.state = {
      addPartType: null,
      setOrgAuto: true,
      selectedOrg: null,
      users: "",
      submitting: false,
      errors: null,
    };
  }

  submitHandler(e: React.FormEvent) {
    e.preventDefault();

    let {addPartType, setOrgAuto, selectedOrg, users} = this.state;
    if (!addPartType) {
      alert("Hãy chọn 1 tư cách tham dự.");
      return false;
    }
    users.trim();
    if (users.length === 0) {
      alert("Hãy thêm ít nhất 1 người dùng.");
      return false;
    }
    const userList = users.split(/\s+/).filter(u => u !== "");

    this.setState({submitting: true, errors: null});

    let data: Record<string, unknown> = {
      users: userList, 
      participation_type: addPartType,
      set_org_auto: setOrgAuto,
    };
    if (!setOrgAuto) data.organization = selectedOrg ? selectedOrg.slug : null;

    contestAPI
      .addContestParticipations({key: this.props.ckey, data})
      .then(() => {
        this.props.closeModalHandler();
        this.props.refetch();
        this.setState({submitting: false});
      })
      .catch((err: {response?: {data: unknown; status?: number}}) => {
        this.setState({
          errors: err.response?.data,
          submitting: false,
        });
      });
  }

  closeModalHandler() {
    this.setState({submitting: false, errors: null});
    this.props.closeModalHandler();
  }

  render() {
    const {addPartType, users, submitting, errors} = this.state;

    return (
      <Modal
        show={this.props.modalShow}
        onHide={() => this.closeModalHandler()}
      >
        <Modal.Header>
          <Modal.Title>Thêm Participation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ErrorBox errors={errors} />
          <Form
            id="contest-participation-add-form"
            onSubmit={e => this.submitHandler(e)}
          >
            <div className=""><strong>* Thêm họ với tư cách tham dự:</strong></div>
            <div className="flex-center">
              {VIRTUAL_TYPE.map(type => (
                <div key={`part-${type}`} className="flex-center">
                  <Form.Check
                    inline
                    name="add-participation-type"
                    type="radio"
                    id={`add-participation-type-${type}`}
                    label={`${type}`}
                    checked={type === addPartType}
                    onChange={() => this.setState({addPartType: type})}
                  />
                </div>
              ))}
            </div>

            <div className="mt-1"><strong>* Thêm các tài khoản có username sau:</strong></div>
            <Form.Control
              as="textarea"
              style={{height: "100px"}}
              placeholder="username1 username2 username3"
              value={users}
              onChange={e => this.setState({users: e.target.value})}
            />

            <div className="mt-1"><strong>* Gán tổ chức cho các lượt đăng ký:</strong></div>
            <div className="">
              <input type="checkbox" 
                      id="add-participation-set-org-auto-chkbox"
                      checked={this.state.setOrgAuto}
                      onChange={e => this.setState({ setOrgAuto: e.target.checked })}
              />
              <label htmlFor="add-participation-set-org-auto-chkbox"
                      className="ml-1">
                Tự động set tổ chức từ Tổ chức đại diện ở Profile
              </label>
            <OrgSingleSelect
              disabled={this.state.setOrgAuto}
              onChange={(sel: {slug: string}) => this.setState({selectedOrg: sel})}
              value={this.state.selectedOrg}
            />
            </div>


            <div className="flex-center">
              <em style={{fontSize: "12px"}}>
                **Dán những tên người dùng (space-separated) mà bạn muốn đăng ký
                vào contest. Nếu có người dùng được thêm đã đăng ký, hệ thống sẽ{" "}
                <strong>chỉnh lại participation_type và organization</strong>{" "}
                theo lựa chọn trên form.
              </em>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="dark" onClick={() => this.closeModalHandler()}>
            Đóng
          </Button>
          <Button
            variant="danger"
            disabled={submitting}
            onClick={e => this.submitHandler(e)}
          >
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

let wrapped: React.ComponentClass<ParticipationProps> = Participation;
export default wrapped;
