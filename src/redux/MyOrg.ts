import type { AnyAction } from "redux";

export const UPDATE = "UPDATE_MY_ORGS";
export const UPDATE_SELECT = "UPDATE_SELECTED_ORG";
export const CLEAR = "CLEAR_MY_ORGS";

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

const INITIAL_SELECTED_ORG = {
  name: "Global",
  short_name: "Global",
  slug: null,
};

const INITIAL_STATE = {
  memberOf: [] as Record<string, unknown>[],
  adminOf: [] as Record<string, unknown>[],
  selectedOrg: INITIAL_SELECTED_ORG,
};

const reducer = (state = INITIAL_STATE, action: AnyAction) => {
  switch (action.type) {
    case UPDATE_SELECT:
      return {
        ...state,
        selectedOrg: action.selectedOrg,
      };
    case UPDATE:
      return {
        ...state,
        memberOf: action.memberOf,
        adminOf: action.adminOf,
        selectedOrg: action.selectedOrg || state.selectedOrg,
      };
    case CLEAR:
      return {
        ...state,
        ...INITIAL_STATE,
      };
    default:
      return state;
  }
};

export default reducer;