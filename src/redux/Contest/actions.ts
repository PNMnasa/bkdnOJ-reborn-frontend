import { UPDATE, CLEAR } from "./types";

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
