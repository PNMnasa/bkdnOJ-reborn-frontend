import type { AnyAction } from "redux";

export const ADD_CONTEST = "ADD_CONTEST";
export const ADD_ORG = "ADD_ORG";
export const ADD_FAVORITE_TEAM = "ADD_FAVORITE_TEAM";
export const TOGGLE_ORG_FILTER = "TOGGLE_ORG_FILTER";
export const TOGGLE_FAVORITE_ONLY = "TOGGLE_FAVORITE_ONLY";

export const addContest = ({ contestId }: { contestId: string }) => {
  return {
    type: ADD_CONTEST,
    contestId,
  };
};

export const addOrgToFilter = ({ contestId, orgList }: { contestId: string; orgList: string[] }) => {
  return {
    type: ADD_ORG,
    contestId,
    orgList,
  };
};

export const toggleTeamFavorite = ({
  contestId,
  teamName,
  isFavorite,
}: {
  contestId: string;
  teamName: string;
  isFavorite: boolean;
}) => {
  return {
    type: ADD_FAVORITE_TEAM,
    contestId,
    teamName,
    isFavorite,
  };
};

export const toggleOrgFilter = ({ contestId, isEnable }: { contestId: string; isEnable: boolean }) => {
  return {
    type: TOGGLE_ORG_FILTER,
    contestId,
    isEnable,
  };
};

export const toggleFavoriteOnly = ({
  contestId,
  isEnable,
  isClearAll,
}: {
  contestId: string;
  isEnable: boolean;
  isClearAll: boolean;
}) => {
  return {
    type: TOGGLE_FAVORITE_ONLY,
    contestId,
    isEnable,
    isClearAll,
  };
};

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