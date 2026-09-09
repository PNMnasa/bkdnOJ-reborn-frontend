import type { AnyAction } from "redux";

export const SET_CONTEST_PARAMS = "SUBFILTER_SET_CT_PARAMS";
export const SET_PUBLIC_PARAMS = "SUBFILTER_SET_PB_PARAMS";

export const CLEAR_CONTEST_PARAMS = "SUBFILTER_CLEAR_CT_PARAMS";
export const CLEAR_PUBLIC_PARAMS = "SUBFILTER_CLEAR_PB_PARAMS";

export const CLEAR_ALL_PARAMS = "SUBFILTER_CLEAR_A_PARAMS";

export const NO_CONTEST_KEY = "P";

export const setContestParams = ({ key, params }: { key: string; params: Record<string, unknown> }) => {
  return {
    type: SET_CONTEST_PARAMS,
    key: key,
    params: { ...params },
  };
};

export const setPublicParams = ({ params }: { params: Record<string, unknown> }) => {
  return {
    type: SET_PUBLIC_PARAMS,
    key: NO_CONTEST_KEY,
    params: { ...params },
  };
};

export const clearContestParams = ({ key }: { key: string }) => {
  return {
    type: CLEAR_CONTEST_PARAMS,
    key: key,
  };
};

export const clearPublicParams = () => {
  return {
    type: CLEAR_PUBLIC_PARAMS,
    key: NO_CONTEST_KEY,
  };
};

export const clearAllParams = () => {
  return {
    type: CLEAR_ALL_PARAMS,
  };
};

const INITIAL_STATE: Record<string, Record<string, unknown>> = {};

const reducer = (state = INITIAL_STATE, action: AnyAction) => {
  switch (action.type) {
    case SET_CONTEST_PARAMS:
    case SET_PUBLIC_PARAMS:
      return {
        ...state,
        [action.key]: {
          ...action.params,
        },
      };
    case CLEAR_CONTEST_PARAMS:
    case CLEAR_PUBLIC_PARAMS:
      return {
        ...state,
        [action.key]: {},
      };
    case CLEAR_ALL_PARAMS:
      return {};
    default:
      return state;
  }
};

export default reducer;