import { UPDATE, CLEAR } from "./types";

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
