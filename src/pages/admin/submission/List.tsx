import React from "react";
import ReactPaginate from "react-paginate";
import {Link} from "react-router";
import {Table} from "react-bootstrap";

import {SpinLoader, ErrorBox} from "components";
import submissionApi from "api/submission";
import {setTitle} from "helpers/setTitle";

import "styles/ClassicPagination.css";

interface SubmissionListItemProps {
  id: number | string;
  date: string;
  status: string;
  result: string;
  user: string;
  contest_object: string | null;
  problem: {
    shortname: string;
    title: string;
    [key: string]: unknown;
  };
  selectChk: boolean;
  onSelectChkChange: () => void;
  [key: string]: unknown;
}

class SubmissionListItem extends React.Component<SubmissionListItemProps> {
  render() {
    const {id, date, status, result, user, contest_object, problem} =
      this.props;
    const {selectChk, onSelectChkChange} = this.props;

    const verdict = result ? result : status;

    return (
      <tr>
        <td className="text-truncate" style={{maxWidth: "40px"}}>
          <Link to={`/admin/submission/${id}`}>{id}</Link>
        </td>
        <td className="text-truncate" style={{maxWidth: "100px"}}>
          <Link to={`/admin/problem/${problem.shortname}`}>
            {problem.title}
          </Link>
        </td>
        <td className="text-truncate" style={{maxWidth: "100px"}}>
          {contest_object ? (
            <Link to={`/admin/contest/${contest_object}`}>
              {contest_object}
            </Link>
          ) : (
            "None"
          )}
        </td>
        <td className="text-truncate" style={{maxWidth: "100px"}}>
          <Link to={`/admin/user/${user}`}>{user}</Link>
        </td>
        <td>{verdict}</td>
        <td className="text-truncate" style={{maxWidth: "200px"}}>
          {new Date(date).toLocaleString()}
        </td>
        <td>
          <input
            type="checkbox"
            value={selectChk as unknown as string}
            onChange={() => onSelectChkChange()}
          />
        </td>
      </tr>
    );
  }
}

interface SubmissionData {
  id: number | string;
  [key: string]: unknown;
}

interface AdminSubmissionListState {
  submissions: SubmissionData[];
  selectChk: boolean[];
  currPage: number;
  pageCount: number;
  loaded: boolean;
  errors: unknown;
  selectedZip: File | null;
  submitting: boolean;
  count: number;
}

class AdminSubmissionList extends React.Component<Record<string, never>, AdminSubmissionListState> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      submissions: [],
      selectChk: [],
      currPage: 0,
      pageCount: 1,
      loaded: false,
      errors: null,

      selectedZip: null,
      submitting: false,
      count: 0,
    };
    setTitle("Admin | Submissions");
  }

  selectChkChangeHandler(idx: number) {
    const {selectChk} = this.state;
    if (idx >= selectChk.length) console.log("Invalid delete tick position");
    else {
      const val = selectChk[idx];
      this.setState({
        selectChk: selectChk
          .slice(0, idx)
          .concat(!val, selectChk.slice(idx + 1)),
      });
    }
  }

  callApi(params: { page: number }) {
    this.setState({loaded: false, errors: null});

    submissionApi
      .getSubmissions({page: params.page + 1})
      .then(res => {
        this.setState({
          submissions: res.data.results,
          count: res.data.count,
          pageCount: res.data.total_pages,
          currPage: params.page,

          selectChk: Array(res.data.results.length).fill(false),
          loaded: true,
        });
      })
      .catch((err: { response?: { data: unknown } }) => {
        this.setState({
          loaded: true,
          errors: {
            errors: err.response?.data || [
              "Cannot fetch submissions. Please retry again.",
            ],
          },
        });
      });
  }

  componentDidMount() {
    this.callApi({page: this.state.currPage});
  }

  handlePageClick = (event: { selected: number }) => {
    this.callApi({page: event.selected});
  };

  handleDeleteSelect(e: React.MouseEvent) {
    e.preventDefault();

    let ids: (number | string)[] = [];
    this.state.selectChk.forEach((v, i) => {
      if (v) ids.push(this.state.submissions[i].id);
    });

    if (ids.length === 0) {
      alert("Không có Submission nào đang được chọn.");
      return;
    }

    const conf = window.confirm(
      "Xóa các Submission " + JSON.stringify(ids) + "?"
    );
    if (conf) {
      let reqs: Promise<unknown>[] = [];
      ids.forEach(id => {
        reqs.push(submissionApi.adminDeleteSubmission({id}));
      });

      Promise.all(reqs)
        .then(() => {
          this.callApi({page: this.state.currPage});
        })
        .catch((err: { response?: { status: number } }) => {
          let msg = "Không thể xóa các submission này.";
          if (err.response) {
            if (err.response.status === 405)
              msg += " Phương thức chưa được implemented.";
            if (err.response.status === 404)
              msg =
                "Không tìm thấy một trong số Submission được chọn. Có lẽ chúng đã bị xóa?";
            if ([403, 401].includes(err.response.status))
              msg = "Không có quyền cho thao tác này.";
          }
          this.setState({errors: {errors: msg}});
        });
    }
  }

  render() {
    const {submitting} = this.state;

    return (
      <div className="admin admin-submissions wrapper-vanilla">
        <div className="admin-options">
          <sub>No options available yet</sub>
        </div>

        <div className="admin-note text-center mb-1">
          {submitting && (
            <span className="loading_3dot">Đang xử lý yêu cầu</span>
          )}
        </div>

        <div className="admin-table submission-table">
          <h4>Submission List</h4>
          <ErrorBox errors={this.state.errors} />
          <Table
            responsive
            hover
            size="sm"
            striped
            bordered
            className="rounded"
          >
            <thead>
              <tr>
                <th style={{maxWidth: "10%"}}>#</th>
                <th style={{minWidth: "20%", maxWidth: "20%"}}>Problem</th>
                <th style={{width: "12%"}}>Contest</th>
                <th style={{width: "10%"}}>Author</th>
                <th style={{width: "10%"}}>Status</th>
                <th style={{width: "20%"}}>When</th>
                <th style={{width: "8%"}}>
                  <Link to="#" onClick={e => this.handleDeleteSelect(e)}>
                    Delete
                  </Link>
                </th>
              </tr>
            </thead>
            <tbody>
              {this.state.loaded === false && (
                <tr>
                  <td colSpan={7}>
                    <SpinLoader margin="10px" />
                  </td>
                </tr>
              )}
              {this.state.loaded === true &&
                (this.state.count > 0 ? (
                  this.state.submissions.map((sub, idx) => (
                    <SubmissionListItem
                      key={`sub-${sub.id}`}
                      {...sub}
                      id={sub.id}
                      date={sub.date as string}
                      status={sub.status as string}
                      result={sub.result as string}
                      user={sub.user as string}
                      contest_object={sub.contest_object as string | null}
                      problem={sub.problem as SubmissionListItemProps["problem"]}
                      selectChk={this.state.selectChk[idx]}
                      onSelectChkChange={() => this.selectChkChangeHandler(idx)}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={99}>
                      <em>No Submission be found.</em>
                    </td>
                  </tr>
                ))}
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
                pageLabelBuilder={page => `[${page}]`}
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
    );
  }
}

export default AdminSubmissionList;
