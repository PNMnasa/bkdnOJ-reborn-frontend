import {
  SET_CONTEST_PARAMS,
  SET_PUBLIC_PARAMS,
  CLEAR_CONTEST_PARAMS,
  CLEAR_PUBLIC_PARAMS,
  CLEAR_ALL_PARAMS,

  NO_CONTEST_KEY,
} from "./types";

export const setContestParams = ({ key, params }: { key: string; params: Record<string, unknown> }) => {
  return {
    type: SET_CONTEST_PARAMS,
    key: key,
    params: { ...params },
  };
};

export const setPublicParams = ({ params }: { params: Record<string, unknown> }) => {
  return {
    type: SET_PUBLIC_PARAMS,
    key: NO_CONTEST_KEY,
    params: { ...params },
  };
};

export const clearContestParams = ({ key }: { key: string }) => {
  return {
    type: CLEAR_CONTEST_PARAMS,
    key: key,
  };
};

export const clearPublicParams = () => {
  return {
    type: CLEAR_PUBLIC_PARAMS,
    key: NO_CONTEST_KEY,
  };
};

export const clearAllParams = () => {
  return {
    type: CLEAR_ALL_PARAMS,
  };
};
