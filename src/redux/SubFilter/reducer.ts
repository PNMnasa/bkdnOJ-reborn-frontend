import { AnyAction } from "redux";
import {
  SET_CONTEST_PARAMS,
  SET_PUBLIC_PARAMS,
  CLEAR_CONTEST_PARAMS,
  CLEAR_PUBLIC_PARAMS,
  CLEAR_ALL_PARAMS,
} from "./types";

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
