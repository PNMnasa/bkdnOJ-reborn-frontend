import { UPDATE, UPDATE_SELECT, CLEAR } from "./types";

type Org = { name?: string; short_name?: string; slug: string | null };

export const updateMyOrg = ({
  memberOf,
  adminOf,
  selectedOrg,
}: {
  memberOf: Org[];
  adminOf: Org[];
  selectedOrg?: Org;
}) => {
  return {
    type: UPDATE,
    memberOf,
    adminOf,
    selectedOrg,
  };
};

export const updateSelectedOrg = ({ selectedOrg }: { selectedOrg: Org }) => {
  return {
    type: UPDATE_SELECT,
    selectedOrg,
  };
};

export const clearMyOrg = () => {
  return {
    type: CLEAR,
  };
};
