import React from "react";
import AsyncSelect from "react-select/async";
import type { SingleValue } from "react-select";

import problemAPI from "api/problem";

interface Problem {
  shortname: string;
  title?: string;
  [key: string]: unknown;
}

const ProblemSelectLabel = ({ shortname, title }: { shortname?: string; title?: string }) => {
  return shortname ? (
    <div
      className="problem-choice text-left d-flex flex-column"
      style={{
        fontSize: "14px",
        maxWidth: "300px",
      }}
    >
      <span>
        <span className="rounded bg-dark text-light pl-1 pr-1 mr-1">prob</span>
        {title}
      </span>
      <span style={{ fontSize: "10px" }}>{shortname}</span>
    </div>
  ) : (
    <></>
  );
};

interface ProblemSingleSelectProps {
  prob: Problem;
  onChange: (prob: Problem) => void;
}

export default class ProblemSingleSelect extends React.Component<ProblemSingleSelectProps> {
  async loadOptions(val: string) {
    return problemAPI
      .getProblems({ params: { search: val, ordering: "-modified" } })
      .then((res) => {
        const data = res.data.results.map((prob: Problem) => ({
          value: prob.shortname,
          label: ProblemSelectLabel(prob),
          prob: prob,
        }));
        return data;
      });
  }

  render() {
    const { prob } = this.props;
    return (
      <AsyncSelect
        cacheOptions
        defaultOptions={!prob.shortname}
        placeholder="Search problem code/title"
        noOptionsMessage={() => "Không tìm thấy. Hãy thử đổi nội dung tìm kiếm."}
        loadOptions={(val: string) => this.loadOptions(val)}
        onChange={(sel) => {
          const selected = sel as SingleValue<{ prob: Problem }>;
          if (selected) this.props.onChange(selected.prob);
        }}
        value={{
          value: prob.shortname,
          label: ProblemSelectLabel({ shortname: prob.shortname, title: prob.title }),
        }}
        styles={{
          menu: () => ({
            zIndex: 50,
            position: "fixed",
            backgroundColor: "#fff",
          }),
          valueContainer: () => ({
            display: "flex",
          }),
        }}
      />
    );
  }
}