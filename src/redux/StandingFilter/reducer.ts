import type { AnyAction } from "redux";
import {
  ADD_CONTEST,
  ADD_FAVORITE_TEAM,
  ADD_ORG,
  TOGGLE_FAVORITE_ONLY,
  TOGGLE_ORG_FILTER,
} from "./types";

interface StandingFilterEntry {
  filteredOrg: string[];
  isOrgFilterEnable: boolean;
  favoriteTeams: string[];
  isFavoriteOnly: boolean;
}

const INIT_STATE: { standingFilter: Record<string, StandingFilterEntry> } = {
  standingFilter: {},
};

const reducer = (state = INIT_STATE, action: AnyAction) => {
  let newStandingFilter: Record<string, StandingFilterEntry>;

  switch (action.type) {
    case ADD_CONTEST:
      newStandingFilter = { ...state.standingFilter };
      newStandingFilter[action.contestId] = {
        filteredOrg: [],
        isOrgFilterEnable: false,
        favoriteTeams: [],
        isFavoriteOnly: false,
      };
      return {
        ...state,
        standingFilter: newStandingFilter,
      };

    case ADD_ORG:
      newStandingFilter = { ...state.standingFilter };
      newStandingFilter[action.contestId].filteredOrg = action.orgList;
      return {
        ...state,
        standingFilter: newStandingFilter,
      };

    case ADD_FAVORITE_TEAM:
      newStandingFilter = { ...state.standingFilter };
      if (action.isFavorite) {
        newStandingFilter[action.contestId].favoriteTeams.push(action.teamName);
      } else {
        newStandingFilter[action.contestId].favoriteTeams = newStandingFilter[
          action.contestId
        ].favoriteTeams.filter((team) => team !== action.teamName);
      }

      return {
        ...state,
        standingFilter: newStandingFilter,
      };

    case TOGGLE_ORG_FILTER:
      newStandingFilter = { ...state.standingFilter };
      newStandingFilter[action.contestId].isOrgFilterEnable = action.isEnable;
      return {
        ...state,
        standingFilter: newStandingFilter,
      };

    case TOGGLE_FAVORITE_ONLY:
      newStandingFilter = { ...state.standingFilter };
      newStandingFilter[action.contestId].isFavoriteOnly = action.isEnable;
      if (action.isClearAll) {
        newStandingFilter[action.contestId].favoriteTeams = [];
      }

      return {
        ...state,
        standingFilter: newStandingFilter,
      };

    default:
      return state;
  }
};

export default reducer;
