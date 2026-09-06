import React from "react";

import AsyncSelect from "react-select/async";

import orgAPI from "api/organization";

import type { MultiValue } from "react-select";
import type { ReactNode } from "react";

interface Org {
  slug: string;
  short_name?: string;
  is_unlisted?: boolean;
  [key: string]: unknown;
}

interface OrgSelectLabelProps {
  slug?: string;
  short_name?: string;
  is_unlisted?: boolean;
}

const OrgSelectLabel = ({ slug, short_name, is_unlisted }: OrgSelectLabelProps) => {
  let boundColor = "bg-dark",
    boundText = "org";
  if (is_unlisted) {
    boundColor = "bg-secondary";
    boundText = "private";
  }

  return (
    <div
      className="org-choice text-left d-flex flex-column"
      style={{ fontSize: "14px" }}
    >
      <span>
        <span className={`rounded text-light pl-1 pr-1 mr-1 ${boundColor}`}>{boundText}</span>
        {slug}
      </span>
      <span style={{ fontSize: "10px" }} className="text-truncate">
        {`${short_name}`}
      </span>
    </div>
  );
};

interface OrgMultiSelectProps {
  value?: Org[];
  isDisabled?: boolean;
  onChange: (orgs: Org[]) => void;
}

export default class OrgMultiSelect extends React.Component<OrgMultiSelectProps> {
  async loadOptions(val: string) {
    return orgAPI.getAllOrgs({ params: { search: val } }).then((res) => {
      const data = res.data.results.map((org: Org) => ({
        value: org.slug,
        label: <OrgSelectLabel {...org} />,
        data: org,
      }));
      return data;
    });
  }

  render() {
    const orgs = this.props.value || [];

    return (
      <AsyncSelect
        isMulti
        isDisabled={this.props.isDisabled || false}
        cacheOptions
        placeholder="Tìm slug/name/short_name..."
        noOptionsMessage={() =>
          "Hệ thống chỉ trả về 20 Orgs khớp tìm kiếm nhất. " +
          "Hãy thử đổi nội dung tìm nếu không tìm thấy Org mong muốn."
        }
        loadOptions={(val: string) => this.loadOptions(val)}
        onChange={(sel) =>
          this.props.onChange(
            (sel as MultiValue<{ data: Org }>).map((select) => ({ ...select.data }))
          )
        }
        value={orgs.map((org) => ({
          value: org.slug,
          label: <OrgSelectLabel {...org} /> as unknown as ReactNode,
          data: org,
        }))}
        styles={{
          container: () => ({
            width: "100%",
          }),
        }}
      />
    );
  }
}