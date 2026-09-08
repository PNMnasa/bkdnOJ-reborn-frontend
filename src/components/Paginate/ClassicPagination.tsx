import React from "react";
import "./ClassicPagination.scss";

interface ClassicPaginationProps {
  pageCount: number;
  currPage: number;
  count: number;
}

export default class ClassicPagination extends React.Component<ClassicPaginationProps> {
  render() {
    const {pageCount, currPage, count} = this.props;

    let pages: React.ReactNode[] = [];
    for (let i = 1; i <= pageCount; i++) {
      pages.push(
        i === currPage ? <a className="active">{`[${i}]`}</a> : <a>{`[${i}]`}</a>
      );
    }

    return (
      <span className="classic-pagination">
        {" "}
        Page:
        {[...pages]}({count} item(s).)
      </span>
    );
  }
}