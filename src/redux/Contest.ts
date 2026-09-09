import type { AnyAction } from "redux";

export const UPDATE = "UPDATE_CONTEST";
export const CLEAR = "CLEAR_CONTEST";

export const updateContest = ({ contest }: { contest: Record<string, unknown> | null }) => {
  return {
    type: UPDATE,
    contest,
    virtual: (contest && contest.virtual) || null,
  };
};

export const clearContest = () => {
  return {
    type: CLEAR,
  };
};

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