import {
  ADD_CONTEST,
  ADD_FAVORITE_TEAM,
  ADD_ORG,
  TOGGLE_FAVORITE_ONLY,
  TOGGLE_ORG_FILTER,
} from "./types";

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
