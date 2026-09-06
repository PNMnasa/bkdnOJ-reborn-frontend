import { AnyAction } from "redux";
import { UPDATE, CLEAR } from "./types";

const INITIAL_STATE = {
  contest: null,
};

const reducer = (state = INITIAL_STATE, action: AnyAction) => {
  switch (action.type) {
    case UPDATE:
      return {
        ...state,
        contest: action.contest,
      };
    case CLEAR:
      return {
        ...state,
        contest: null,
      };
    default:
      return state;
  }
};

export default reducer;
