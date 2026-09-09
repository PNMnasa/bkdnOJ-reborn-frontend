import type { AnyAction } from "redux";

export const UPDATE = "UPDATE_PROFILE";
export const CLEAR = "CLEAR_PROFILE";

export const updateProfile = ({ profile }: { profile: Record<string, unknown> | null }) => {
  return {
    type: UPDATE,
    profile,
  };
};

export const clearProfile = () => {
  return {
    type: CLEAR,
  };
};

const INITIAL_STATE = {
  profile: null,
};

const reducer = (state = INITIAL_STATE, action: AnyAction) => {
  switch (action.type) {
    case UPDATE:
      return {
        ...state,
        profile: action.profile,
      };
    case CLEAR:
      return {
        ...state,
        profile: null,
      };
    default:
      return state;
  }
};

export default reducer;