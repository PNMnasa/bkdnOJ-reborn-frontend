import { UPDATE, CLEAR } from "./types";

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
