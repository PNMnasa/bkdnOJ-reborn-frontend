import type { AnyAction } from "redux";

export const START_POLLING = "RS_START_POLLING";
export const STOP_POLLING = "RS_STOP_POLLING";

export const startPolling = () => {
  return {
    type: START_POLLING,
  };
};

export const stopPolling = () => {
  return {
    type: STOP_POLLING,
  };
};

const INITIAL_STATE = {
  polling: 0,
};

const reducer = (state = INITIAL_STATE, action: AnyAction) => {
  switch (action.type) {
    case START_POLLING:
      return {
        ...state,
        polling: state.polling + 1,
      };
    case STOP_POLLING:
      return {
        ...state,
        polling: 0,
      };
    default:
      return state;
  }
};

export default reducer;