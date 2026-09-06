import { UPDATE } from "./types";

export const updateRanks = ({ ranks }: { ranks: Record<string, unknown>[] }) => {
  return {
    type: UPDATE,
    ranks,
  };
};
