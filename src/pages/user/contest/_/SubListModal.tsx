import React from "react";

import {Modal} from "react-bootstrap";

import {SpinLoader, ErrorBox} from "components";
import ReactPaginate from "react-paginate";
import contestAPI from "api/contest";

// Assets
import { FaExternalLinkAlt } from "components/icons";


// Styles
import "styles/SubmissionVerdict.css";
import "styles/ClassicPagination.css";

interface SubShape {
  id: number | string;
  status: string;
  result?: string;
  date: string;
  problem: { points?: number };
  is_frozen?: boolean;
  points?: number | null;
  [key: string]: unknown;
}

interface SubListModalProps {
  show: boolean;
  onHide: () => void;
  data: {
    user?: string;
    problem?: string;
    contest?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface SubListModalState {
  loaded: boolean;
  errors: unknown;

  currPage: number;
  pageCount: number;
  count: number;
  subs: SubShape[] | null;
}

class SubListModal extends React.Component<SubListModalProps, SubListModalState> {
  constructor(props: SubListModalProps) {
    super(props);
    this.state = {
      loaded: false,
      errors: null,

      currPage: 0,
      pageCount: 1,
      count: 0,
      subs: null,
    };
  }

  fetch(page = 0) {
    this.setState({loaded: false, errors: null});
    const params = {
      user: this.props.data.user,
      problem: this.props.data.problem,
      page: page + 1,
    };

    contestAPI
      .getContestSubmissions({key: this.props.data.contest!, params})
      .then((res: { data: { results: SubShape[]; total_pages: number; count: number } }) => {
        this.setState({
          loaded: true,
          subs: res.data.results,
          pageCount: res.data.total_pages,
          currPage: page,
          count: res.data.count,
        });
      })
      .catch((err: { response?: { data?: unknown } }) => {
        const __err =
          err.response?.data || "Cannot fetch submissions at the moment.";
        this.setState({loaded: true, errors: __err});
      });
  }

  componentDidUpdate(prevProps: SubListModalProps, _prevState: SubListModalState) {
    if (prevProps.show === false && this.props.show === true) this.fetch();
  }

  handlePageClick = (event: { selected: number }) => {
    this.fetch(event.selected);
  };

  render() {
    const {data} = this.props;
    const {loaded, subs, errors, count} = this.state;

    return (
      <Modal
        show={this.props.show}
        onHide={() => this.props.onHide()}
        centered
        size="lg"
      >
        <Modal.Header>
          <Modal.Title style={{fontSize: "16px"}}>
            Participant <strong>{data.user}</strong>'s submissions for problem{" "}
            <strong>{data.problem}</strong>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <ErrorBox errors={this.state.errors as string | string[] | Record<string, unknown> | null} />
          {!loaded && (
            <div className="text-center w-100">
              <SpinLoader size="20" margin="30px" />
            </div>
          )}
          {loaded && !errors && count === 0 && (
            <>
              <div className="p-3">
                <em>No submission can be found.</em>
              </div>
            </>
          )}
          {loaded && !errors && count > 0 && (
            <>
              <ul>
                {subs!.map((sub, idx) => {
                  const verdict = sub.status === "D" ? sub.result || sub.status : sub.status;
                  const max_points = sub.problem.points;
                  const {is_frozen, points} = sub;

                  return (
                    <li key={`pt-pb-sub-${idx}`} className="flex-center">
                      <span className="m-1">{`${new Date(
                        sub.date
                      ).toLocaleString()}`}</span>
                      -
                      <span className={`verdict ${verdict.toLowerCase()}`}>
                        <span className={`text m-1`}>{verdict}</span>|
                        {typeof points === "number" ? (
                          <span className="m-1">
                            {points}/{max_points} pts
                          </span>
                        ) : (
                          <span className="points-container available m-1">
                            <span className="sub-points text-truncate">
                              {is_frozen ? "?" : "n/a"}
                            </span>
                          </span>
                        )}
                      </span>
                      -
                      <a
                        href={`/submission/${sub.id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span
                          className="d-inline-flex align-items-baseline m-1"
                          style={{columnGap: "5px"}}
                        >
                          #{sub.id} <FaExternalLinkAlt size={14} />
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <span className="classic-pagination">
            Page:{" "}
            <ReactPaginate
              breakLabel="..."
              onPageChange={this.handlePageClick}
              forcePage={this.state.currPage}
              pageLabelBuilder={(page: number) => `[${page}]`}
              pageRangeDisplayed={5}
              pageCount={this.state.pageCount}
              renderOnZeroPageCount={null}
              previousLabel={null}
              nextLabel={null}
            />
          </span>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default SubListModal;