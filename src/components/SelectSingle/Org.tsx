import React from "react";

import AsyncSelect from "react-select/async";

import { orgClient } from "api";
import type { SingleValue } from "react-select";

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
    <div className="org-choice text-left d-flex flex-column" style={{ fontSize: "14px" }}>
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

interface OrgSingleSelectProps {
  value?: Org | null;
  disabled?: boolean;
  onChange: (org: Org) => void;
}

export default class OrgSingleSelect extends React.Component<OrgSingleSelectProps> {
  async loadOptions(val: string) {
    return orgClient.getAllOrgs({ params: { search: val } }).then((res) => {
      const data = res.data.results.map((org: Org) => ({
        value: org.slug,
        label: <OrgSelectLabel {...org} />,
        data: org,
      }));
      return data;
    });
  }

  render() {
    const org = this.props.value;

    return (
      <AsyncSelect
        cacheOptions
        placeholder="Tìm slug/name/short_name..."
        noOptionsMessage={() =>
          "Hệ thống chỉ trả về 20 Orgs khớp tìm kiếm nhất. " +
          "Hãy thử đổi nội dung tìm nếu không tìm thấy Org mong muốn."
        }
        isDisabled={this.props.disabled}
        loadOptions={(val: string) => this.loadOptions(val)}
        onChange={(sel) => {
          const selected = sel as SingleValue<{ data: Org }>;
          if (selected) this.props.onChange({ ...selected.data });
        }}
        value={org ? { value: org.slug, label: <OrgSelectLabel {...org} />, data: org } : null}
        styles={{
          container: () => ({
            width: "100%",
          }),
        }}
      />
    );
  }
}