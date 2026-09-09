import type { AnyAction } from "redux";
import { __ls_remove_credentials } from "helpers/localStorageHelpers";

export const UPDATE = "UPDATE_USER";
export const CLEAR = "CLEAR_USER";

export const updateUser = ({ user }: { user: Record<string, unknown> | null }) => {
  return {
    type: UPDATE,
    user,
  };
};

export const clearUser = () => {
  return {
    type: CLEAR,
  };
};

const INITIAL_STATE = {
  user: null,
};

const reducer = (state = INITIAL_STATE, action: AnyAction) => {
  switch (action.type) {
    case UPDATE:
      return {
        ...state,
        user: action.user,
      };
    case CLEAR:
      __ls_remove_credentials();
      return {
        ...state,
        user: null,
      };
    default:
      return state;
  }
};

export default reducer;