import React from "react";

import AsyncSelect from "react-select/async";

import { userClient } from "api";

import type { MultiValue } from "react-select";

interface User {
  username: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  [key: string]: unknown;
}

interface UserSelectLabelProps {
  username?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
}

const UserSelectLabel = ({
  username,
  first_name,
  last_name,
  is_active,
  is_staff,
  is_superuser,
}: UserSelectLabelProps) => {
  let boundColor = "bg-dark",
    boundText = "user";
  if (!is_active) {
    boundColor = "bg-secondary";
    boundText = "inactive";
  } else if (is_staff || is_superuser) {
    boundColor = "bg-danger";
    boundText = is_superuser ? "admin" : "staff";
  }

  return (
    <div className="user-choice text-left d-flex flex-column" style={{ fontSize: "14px" }}>
      <span>
        <span className={`rounded text-light pl-1 pr-1 mr-1 ${boundColor}`}>{boundText}</span>
        {username}
      </span>
      <span style={{ fontSize: "10px" }}>{`${first_name} ${last_name}`}</span>
    </div>
  );
};

interface UserMultiSelectProps {
  value?: User[];
  onChange: (users: User[]) => void;
}

export default class UserMultiSelect extends React.Component<UserMultiSelectProps> {
  async loadOptions(val: string) {
    return userClient.getUsers({ params: { search: val } }).then((res) => {
      const data = res.data.results.map((user: User) => ({
        value: user.username,
        label: <UserSelectLabel {...user} />,
        data: user,
      }));
      return data;
    });
  }

  render() {
    const users = this.props.value;

    return (
      <AsyncSelect
        isMulti
        cacheOptions
        placeholder="Tìm username/first name/last name..."
        noOptionsMessage={() =>
          "Hệ thống chỉ trả về 20 users khớp tìm kiếm nhất. " +
          "Hãy thử đổi nội dung tìm nếu không tìm thấy User mong muốn."
        }
        loadOptions={(val: string) => this.loadOptions(val)}
        onChange={(sel) =>
          this.props.onChange(
            (sel as MultiValue<{ data: User }>).map((select) => ({ ...select.data }))
          )
        }
        value={(users || []).map((user) => ({
          value: user.username,
          label: <UserSelectLabel {...user} />,
          data: user,
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