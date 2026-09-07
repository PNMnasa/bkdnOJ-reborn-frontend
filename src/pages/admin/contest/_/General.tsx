/* eslint-disable no-unused-vars */
import React from "react";
import {toast} from "react-toastify";
import {Form, Row, Col, Button, Accordion} from "react-bootstrap";

import contestAPI from "api/contest";
import {ErrorBox, RichTextEditor} from "components";
import {withNavigation} from "helpers/react-router";

import UserMultiSelectRaw from "components/SelectMulti/User";
import OrgMultiSelectRaw from "components/SelectMulti/Org";

const UserMultiSelect = UserMultiSelectRaw as React.ComponentType<any>;
const OrgMultiSelect = OrgMultiSelectRaw as React.ComponentType<any>;

interface GeneralProps {
  ckey: string;
  data: Record<string, unknown>;
  refetch?: () => void;
  navigate: (to: string) => void;
}

interface GeneralState {
  ckey: string;
  data: Record<string, unknown>;
  errors: unknown;
}

class General extends React.Component<GeneralProps, GeneralState> {
  constructor(props: GeneralProps) {
    super(props);
    this.state = {
      ckey: this.props.ckey,
      data: this.props.data,
      errors: null,
    };
  }

  // -------------- Setters Getters
  inputChangeHandler(event: React.ChangeEvent<HTMLInputElement>, params = {isCheckbox: null as boolean | null}) {
    const isCheckbox = params.isCheckbox || false;

    let newData = this.state.data;
    if (!isCheckbox) newData[event.target.id] = event.target.value;
    else {
      newData[event.target.id] = !newData[event.target.id];
    }
    this.setState({data: newData});
  }
  getTime(key: string) {
    const data = this.state.data;
    if (data && data[key]) {
      let time = new Date(data[key] as string);
      time.setMinutes(time.getMinutes() - time.getTimezoneOffset());
      return time.toISOString().slice(0, 16);
    }
    return "";
  }
  setTime(key: string, v: string) {
    let time = new Date(v);
    const data = this.state.data;
    this.setState({data: {...data, [key]: time.toISOString()}});
  }

  // -------------- apis
  refetch() {
    if (this.props.refetch) this.props.refetch();
  }

  // ------------- Lifecycle
  componentDidUpdate(prevProps: GeneralProps) {
    if (prevProps.data !== this.props.data) {
      this.setState({data: this.props.data});
    }
  }

  // ------------- form submit
  formSubmitHandler(e: React.FormEvent) {
    e.preventDefault();
    this.setState({errors: null});

    let sendData = {...this.state.data};

    contestAPI
      .updateContest({key: this.state.ckey, data: sendData})
      .then(results => {
        toast.success("OK Updated.");
        if (results.data.key !== this.state.ckey)
          this.props.navigate(`/admin/contest/${results.data.key}`);
        else this.props.refetch && this.props.refetch();
      })
      .catch((err: {response?: {data: unknown; status?: number}}) => {
        toast.error(`Update Failed. (${err.response?.status})`);
        this.setState({errors: {errors: err.response?.data}});
      });
  }

  render() {
    const {data} = this.state;

    return (
      <>
        <ErrorBox errors={this.state.errors} />
        <Form id="contest-general" onSubmit={e => this.formSubmitHandler(e)}>
          <Row id="contest-id-row">
            <Form.Label column="sm" sm={1}>
              {" "}
              ID{" "}
            </Form.Label>
            <Col sm={2}>
              {" "}
              <Form.Control
                size="sm"
                type="text"
                placeholder="Contest id"
                id="id"
                value={(data.id as string) || ""}
                disabled
                readOnly
              />
            </Col>

            <Form.Label column="sm" sm={1} className="required">
              {" "}
              Key{" "}
            </Form.Label>
            <Col sm={8}>
              {" "}
              <Form.Control
                size="sm"
                type="text"
                placeholder="Contest key/shortname/code"
                id="key"
                value={(data.key as string) || ""}
                onChange={e => this.inputChangeHandler(e as React.ChangeEvent<HTMLInputElement>)}
              />
            </Col>
          </Row>
          <Row>
            <Form.Label column="sm" lg={2} className="required">
              {" "}
              Tên cuộc thi{" "}
            </Form.Label>
            <Col>
              {" "}
              <Form.Control
                size="sm"
                type="text"
                placeholder="Contest Name"
                id="name"
                value={(data.name as string) || ""}
                onChange={e => this.inputChangeHandler(e as React.ChangeEvent<HTMLInputElement>)}
              />
            </Col>
          </Row>

          <Accordion defaultActiveKey="-1">
            <Accordion.Item eventKey="-1" className="general">
              <Accordion.Header>Thiết lập chung</Accordion.Header>
              <Accordion.Body>
                <Row>
                  <Form.Label column="sm" lg={2} className="required">
                    {" "}
                    Thời điểm bắt đầu{" "}
                  </Form.Label>
                  <Col lg={4}>
                    {" "}
                    <Form.Control
                      size="sm"
                      type="datetime-local"
                      id="start_time"
                      value={this.getTime("start_time") || ""}
                      onChange={e => this.setTime(e.target.id, e.target.value)}
                    />
                  </Col>

                  <Form.Label column="sm" lg={2} className="required">
                    {" "}
                    Thời điểm kết thúc{" "}
                  </Form.Label>
                  <Col lg={4}>
                    {" "}
                    <Form.Control
                      size="sm"
                      type="datetime-local"
                      id="end_time"
                      value={this.getTime("end_time") || ""}
                      onChange={e => this.setTime(e.target.id, e.target.value)}
                    />
                  </Col>

                  <Col xl={12}>
                    <sub>
                      Giới hạn thời gian làm bài cho tham dự chính thức (Live
                      Participation).
                    </sub>
                  </Col>
                </Row>

                <Row id="fronzen-settings">
                  <Form.Label column="sm" lg={3}>
                    {" "}
                    Đóng băng Kết quả?{" "}
                  </Form.Label>
                  <Col lg={1}>
                    {" "}
                    <Form.Control
                      size="sm"
                      type="checkbox"
                      id="enable_frozen"
                      checked={(data.enable_frozen as boolean) || false}
                      onChange={e =>
                        this.inputChangeHandler(e as React.ChangeEvent<HTMLInputElement>, {isCheckbox: true})
                      }
                    />
                  </Col>

                  <Form.Label column="sm" lg={3}>
                    {" "}
                    Thời điểm Đóng băng{" "}
                  </Form.Label>
                  <Col lg={5}>
                    {" "}
                    <Form.Control
                      size="sm"
                      type="datetime-local"
                      id="frozen_time"
                      value={this.getTime("frozen_time") || ""}
                      onChange={e => this.setTime(e.target.id, e.target.value)}
                    />
                  </Col>

                  <Col xl={12}>
                    <sub>
                      Sau thời điểm đóng băng, thí sinh không thấy kết quả của
                      submission của thí sinh khác, và bảng điểm sau sẽ không
                      cập nhập kết quả. Thay đổi thời gian đóng băng mà không
                      rejudge sẽ không cập nhập lại điểm và sub đang hiện trên
                      bảng điểm. Hãy cân nhắc khi thay đổi nó trong lúc diễn ra
                      contest. Thiết lập đóng băng hiện chỉ có tác dụng với{" "}
                      <code>contest_format</code> ICPC và IOI.
                    </sub>
                  </Col>
                </Row>

                <Row id="scoreboard-cache-settings">
                  <Form.Label column="sm" md={4}>
                    {" "}
                    Thời gian cache bảng điểm (giây){" "}
                  </Form.Label>
                  <Col>
                    {" "}
                    <Form.Control
                      size="sm"
                      type="number"
                      id="scoreboard_cache_duration"
                      value={data.scoreboard_cache_duration as string | number}
                      onChange={e => this.inputChangeHandler(e as React.ChangeEvent<HTMLInputElement>)}
                    />
                  </Col>
                  <Col xl={12}>
                    <sub>
                      Thời gian mà hệ thống sẽ cache bảng điểm sau mỗi lần tính.
                      Nếu giá trị là <code>0</code> sẽ tắt caching.
                    </sub>
                  </Col>
                </Row>

                <Row>
                  <Form.Label column="sm" md={2}>
                    {" "}
                    Contest Format{" "}
                  </Form.Label>
                  <Col md={10}>
                    <Form.Select
                      aria-label={data.format_name as string}
                      value={(data.format_name as string) || "icpc"}
                      onChange={e => this.inputChangeHandler(e as unknown as React.ChangeEvent<HTMLInputElement>)}
                      size="sm"
                      id="format_name"
                      className="mb-1 w-100"
                    >
                      <option value="icpc">ICPC</option>
                      <option value="ioi">IOI</option>
                    </Form.Select>
                  </Col>

                  <Form.Label column="sm" xl={12}>
                    {" "}
                    Contest Format Custom Config{" "}
                  </Form.Label>
                  <Col>
                    {" "}
                    <Form.Control
                      size="sm"
                      as="textarea"
                      placeholder="JSON - Describe custom contest rules"
                      id="format_config"
                      value={(data.format_config as string) || ""}
                      onChange={e => this.inputChangeHandler(e as React.ChangeEvent<HTMLInputElement>)}
                    />
                  </Col>
                </Row>

                <Row>
                  <Form.Label column="sm" xl={12}>
                    {" "}
                    Mô tả{" "}
                  </Form.Label>
                  <Col>
                    <RichTextEditor
                      value={(data.description as string) || ""}
                      enableEdit={true}
                      onChange={(v?: string) => {
                        let newData = this.state.data;
                        let key = "description";
                        newData[key] = v ?? "";
                        this.setState({data: newData});
                      }}
                    />
                  </Col>
                </Row>

                <Row>
                  <Form.Label column="sm" md={4}>
                    {" "}
                    Làm tròn điểm (đến số thập phân){" "}
                  </Form.Label>
                  <Col>
                    {" "}
                    <Form.Control
                      size="sm"
                      type="number"
                      id="points_precision"
                      value={(data.points_precision as number) || 6}
                      onChange={e => this.inputChangeHandler(e as React.ChangeEvent<HTMLInputElement>)}
                    />
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="1" className="accessibility">
              <Accordion.Header>Quyền truy cập</Accordion.Header>
              <Accordion.Body>
                <Row>
                  <Form.Label column="sm" md={2} className="required">
                    {" "}
                    Authors{" "}
                  </Form.Label>
                  <Col md={10} className="mt-1 mb-1">
                    <UserMultiSelect
                      id="authors"
                      value={(data.authors as unknown[]) || []}
                      onChange={(arr: unknown[]) =>
                        this.setState({data: {...data, authors: arr}})
                      }
                    />
                  </Col>
                  <Col xl={12}>
                    <sub>
                      Đặc quyền Tác giả, sẽ được quyền xem và chỉnh sửa Contest.
                      Tên tác giả sẽ được hiển thị công khai.
                      <span className="text-danger">
                        <strong>*Cẩn thận!</strong> Bạn có thể mất quyền Edit
                        Contest nếu bạn xóa bản thân khỏi danh sách Authors!
                      </span>
                    </sub>
                  </Col>

                  <Form.Label column="sm" md={2}>
                    {" "}
                    Collaborators{" "}
                  </Form.Label>
                  <Col md={10} className="mt-1 mb-1">
                    <UserMultiSelect
                      id="collaborators"
                      value={(data.collaborators as unknown[]) || []}
                      onChange={(arr: unknown[]) =>
                        this.setState({data: {...data, collaborators: arr}})
                      }
                    />
                  </Col>
                  <Col xl={12}>
                    <sub>
                      Đặc quyền Cộng tác viên, sẽ được quyền xem và chỉnh sửa
                      Contest. Tên cộng tác viên sẽ không được hiển thị công
                      khai.
                    </sub>
                  </Col>

                  <Form.Label column="sm" md={2}>
                    {" "}
                    Reviewers{" "}
                  </Form.Label>
                  <Col md={10} className="mt-1 mb-1">
                    <UserMultiSelect
                      id="reviewers"
                      value={(data.reviewers as unknown[]) || []}
                      onChange={(arr: unknown[]) =>
                        this.setState({data: {...data, reviewers: arr}})
                      }
                    />
                  </Col>
                  <Col xl={12}>
                    <sub>
                      Đặc quyền Reviewers, được quyền xem và nộp bài trong
                      Contest.
                    </sub>
                  </Col>
                  <Col xl={12}>
                    <sub>
                      Các bài nộp của những thành viên này sẽ không được nhìn
                      thấy bởi Thí sinh và họ sẽ bị ẩn trên bảng xếp hạng.
                    </sub>
                  </Col>
                </Row>

                <Row>
                  <Form.Label column="sm" xs={6}>
                    {" "}
                    Công bố?{" "}
                  </Form.Label>
                  <Col xs={6}>
                    {" "}
                    <Form.Control
                      size="sm"
                      type="checkbox"
                      id="published"
                      checked={(data.published as boolean) || false}
                      onChange={e =>
                        this.inputChangeHandler(e as React.ChangeEvent<HTMLInputElement>, {isCheckbox: true})
                      }
                    />
                  </Col>
                  <Col xl={12}>
                    <sub>
                      Công bố Contest. Nếu không công bố, chỉ có 3 nhóm người
                      dùng đặc quyền trên mới thầy và tương tác đươc. Nếu có
                      Công bố, tùy vào thiết lập bên dưới mà quyết định quyền
                      View/Edit/Register.
                    </sub>
                  </Col>
                </Row>

                <Row>
                  <Form.Label column="sm" xs={6}>
                    {" "}
                    Công khai cho Tất cả?{" "}
                  </Form.Label>
                  <Col xs={6}>
                    {" "}
                    <Form.Control
                      size="sm"
                      type="checkbox"
                      id="is_visible"
                      checked={(data.is_visible as boolean) || false}
                      onChange={e =>
                        this.inputChangeHandler(e as React.ChangeEvent<HTMLInputElement>, {isCheckbox: true})
                      }
                    />
                  </Col>
                  <Col xl={12}>
                    <sub>
                      Cho phép tất cả User đều thấy contest (các Problems khi
                      contest diễn ra, bảng điểm chưa đóng băng). Họ cũng có thể
                      Register contest nếu cả hai option bên dưới không được
                      tick.
                    </sub>
                  </Col>
                </Row>

                <Row>
                  <Form.Label column="sm" xs={6}>
                    {" "}
                    Contest riêng cho Thí sinh?{" "}
                  </Form.Label>
                  <Col xs={6}>
                    {" "}
                    <Form.Control
                      size="sm"
                      type="checkbox"
                      id="is_private"
                      checked={(data.is_private as boolean) || false}
                      onChange={e =>
                        this.inputChangeHandler(e as React.ChangeEvent<HTMLInputElement>, {isCheckbox: true})
                      }
                    />
                  </Col>

                  <Form.Label column="sm" md={2}>
                    {" "}
                    Thí sinh riêng{" "}
                  </Form.Label>
                  <Col md={10} className="mt-1 mb-1">
                    <UserMultiSelect
                      id="private_contestants"
                      value={(data.private_contestants as unknown[]) || []}
                      onChange={(arr: unknown[]) =>
                        this.setState({
                          data: {...data, private_contestants: arr},
                        })
                      }
                    />
                  </Col>
                  <Col xl={12}>
                    <sub>
                      Chỉ có phép các Thí sinh được thêm Đăng ký Contest với tư
                      cách Thí sinh.
                    </sub>
                  </Col>
                </Row>

                <Row>
                  <Form.Label column="sm" xs={6}>
                    {" "}
                    Contest riêng cho Tổ chức?{" "}
                  </Form.Label>
                  <Col xs={6}>
                    {" "}
                    <Form.Control
                      size="sm"
                      type="checkbox"
                      id="is_organization_private"
                      checked={(data.is_organization_private as boolean) || false}
                      onChange={e =>
                        this.inputChangeHandler(e as React.ChangeEvent<HTMLInputElement>, {isCheckbox: true})
                      }
                    />
                  </Col>

                  <Form.Label column="sm" md={2}>
                    {" "}
                    Tổ chức
                  </Form.Label>
                  <Col md={10}>
                    <OrgMultiSelect
                      id="organizations"
                      value={(data.organizations as unknown[]) || []}
                      onChange={(arr: unknown[]) =>
                        this.setState({data: {...data, organizations: arr}})
                      }
                    />
                  </Col>
                  <Col xl={12}>
                    <sub>
                      Cho phép thành viên của các tổ chức được thêm có thể đăng
                      ký Contest với tư cách Thí sinh. Hơn nữa, các Admin của
                      các tổ chức được thêm có quyền Edit contest.
                    </sub>
                  </Col>
                </Row>

                <Row>
                  <Form.Label column="sm" md={2}>
                    {" "}
                    Cấm những thí sinh này{" "}
                  </Form.Label>
                  <Col className="mt-1 mb-1">
                    <UserMultiSelect
                      id="banned_users"
                      value={(data.banned_users as unknown[]) || []}
                      onChange={(arr: unknown[]) =>
                        this.setState({data: {...data, banned_users: arr}})
                      }
                    />
                  </Col>
                  <Col xl={12}>
                    <sub>Cấm những thí sinh này nộp bài.</sub>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="2" className="rating">
              <Accordion.Header>Rating</Accordion.Header>
              <Accordion.Body>
                <Row>
                  <Form.Label column="sm"> Xếp hạng cuộc thi này? </Form.Label>
                  <Col>
                    {" "}
                    <Form.Control
                      size="sm"
                      type="checkbox"
                      id="is_rated"
                      checked={(data.is_rated as boolean) || false}
                      onChange={e =>
                        this.inputChangeHandler(e as React.ChangeEvent<HTMLInputElement>, {isCheckbox: true})
                      }
                    />
                  </Col>
                </Row>

                <Row>
                  <Form.Label column="sm" sm={3}>
                    {" "}
                    Rating Floor{" "}
                  </Form.Label>
                  <Col sm={3}>
                    {" "}
                    <Form.Control
                      size="sm"
                      type="number"
                      placeholder="0"
                      id="rating_floor"
                      value={(data.rating_floor as string) || ""}
                      onChange={e => this.inputChangeHandler(e as React.ChangeEvent<HTMLInputElement>)}
                    />
                  </Col>

                  <Form.Label column="sm" sm={3}>
                    {" "}
                    Rating Ceiling{" "}
                  </Form.Label>
                  <Col sm={3}>
                    {" "}
                    <Form.Control
                      size="sm"
                      type="number"
                      placeholder="999999"
                      id="rating_ceiling"
                      value={(data.rating_ceiling as string) || ""}
                      onChange={e => this.inputChangeHandler(e as React.ChangeEvent<HTMLInputElement>)}
                    />
                  </Col>
                </Row>

                <Row>
                  <Form.Label column="sm"> Rate For All </Form.Label>
                  <Col>
                    {" "}
                    <Form.Control
                      size="sm"
                      type="checkbox"
                      id="rate_all"
                      checked={(data.rate_all as boolean) || false}
                      onChange={e =>
                        this.inputChangeHandler(e as React.ChangeEvent<HTMLInputElement>, {isCheckbox: true})
                      }
                    />
                  </Col>
                  <Col xl={12}>
                    <sub>
                      Điều chỉnh rating cả những thí sinh có tham dự nhưng không
                      nộp bài.
                    </sub>
                  </Col>
                </Row>

                <Row>
                  <Form.Label column="sm" xs={3}>
                    {" "}
                    Không Rate những thí sinh này{" "}
                  </Form.Label>
                  <Col xs={9}>
                    <UserMultiSelect
                      id="rate_exclude"
                      value={(data.rate_exclude as unknown[]) || []}
                      onChange={(arr: unknown[]) =>
                        this.setState({data: {...data, rate_exclude: arr}})
                      }
                    />
                  </Col>
                  <Col xl={12}>
                    <sub>
                      Ngoài ra, các Thí sinh bị cấm thi (banned) và tước quyền
                      thi đấu (disqualified) sẽ không được rate.
                    </sub>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          <Row>
            <Col xl={10}></Col>
            <Col>
              <Button variant="dark" size="sm" type="submit" className="w-100">
                Save
              </Button>
            </Col>
          </Row>
        </Form>
      </>
    );
  }
}

let wrapped: React.ComponentType<any> = General;
wrapped = withNavigation(wrapped);
export default wrapped;
