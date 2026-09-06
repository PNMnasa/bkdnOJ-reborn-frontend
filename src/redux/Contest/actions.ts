import { UPDATE, CLEAR } from "./types";

export const updateContest = ({ contest }: { contest: Record<string, unknown> | null }) => {
  return {
    type: UPDATE,
    virtual: (contest && contest.virtual) || null,
    ...contest,
  };
};

export const clearContest = () => {
  return {
    type: CLEAR,
  };
};
