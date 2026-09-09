import axios from "axios";
import { toast } from "react-toastify";

import { __ls_get_access_token, __ls_remove_credentials } from "helpers/localStorageHelpers";
import { LS_PERSIST_ROOT } from "constants/localStorageKeys";
import { log } from "helpers/logger";

const stripTrailingSlash = (url: string): string => url.replace(/\/+$/, "");

const joinApiUrl = (host: string | undefined, port: string | undefined): string => {
  let base = host ? stripTrailingSlash(host) : "";
  if (/\/api$/i.test(base)) return `${base}/`;
  if (port && !/:\d+$/.test(base)) {
    base = `${base}:${port}`;
  }
  return `${base}/api/`;
};

const TEST_CONNECTION_URL = joinApiUrl(process.env.REACT_APP_DEV_BACKEND_URL, process.env.REACT_APP_DEV_BACKEND_PORT);
const PROD_CONNECTION_URL = joinApiUrl(process.env.REACT_APP_BACKEND_URL, process.env.REACT_APP_BACKEND_PORT);

export const getConnectionUrl = (): string => {
  const dev_env = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
  // In dev Vite proxies /api -> REACT_APP_DEV_BACKEND_URL:PORT, so the
  // browser only talks to the dev server (same-origin). Avoids
  // net::ERR_CONNECTION_REFUSED / CORS when the backend host differs.
  if (dev_env) return "/api/";
  return PROD_CONNECTION_URL;
};
export const getAdminPageUrl = (): string => {
  return `${getConnectionUrl()}admin/`;
};

export { TEST_CONNECTION_URL, PROD_CONNECTION_URL };

export const axiosClient = axios.create({
  baseURL: getConnectionUrl(),
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const access_token = __ls_get_access_token();
    if (access_token) {
      if (config.headers) {
        config.headers["Authorization"] = "Bearer " + access_token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    const error_obj = JSON.parse(JSON.stringify(error));
    if (error_obj.message && error_obj.message === "Network Error") {
      toast.error(
        "Cannot connect to the server. Please check your internet or contact the admins.",
        {
          toastId: "network-error",
          autoClose: false,
        }
      );

      return Promise.reject({
        response: {
          data: {
            errors: {
              network_error:
                "Could not connect to backend server. " +
                "Please check your internet connection " +
                "and try again.",
            },
          },
        },
      });
    }

    const res = error.response;
    if (!res) {
      return Promise.reject(error);
    }

    switch (res.status) {
      case 429:
        toast.error("Too many requests. Please try again after 1 minute.", {
          toastId: "too-many-req",
        });
        break;
      case 401:
        break;
      case 403:
        if (res.data && res.data.code === "token_not_valid") {
          __ls_remove_credentials();
          localStorage.removeItem(LS_PERSIST_ROOT);
          window.location.href = "/sign-in";
        }
        break;
      default:
        break;
    }
    return Promise.reject(error);
  }
);

export const axiosFormClient = axios.create({
  baseURL: getConnectionUrl(),
  headers: {
    Accept: "application/json",
    "Content-Type": "multipart/form-data",
  },
});

axiosFormClient.interceptors.request.use(
  (config) => {
    const access_token = __ls_get_access_token();
    if (access_token) {
      if (config.headers) {
        config.headers["Authorization"] = "Bearer " + access_token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosFormClient.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    const error_obj = JSON.parse(JSON.stringify(error));
    if (error_obj.message && error_obj.message === "Network Error") {
      log("Network Error detected.");
      toast.error(
        "Cannot connect to the server. Please check your internet or contact the admins.",
        {
          toastId: "network-error",
          autoClose: false,
        }
      );

      return Promise.reject({
        response: {
          data: {
            errors: {
              network_error:
                "Could not connect to backend server. " +
                "Please check your internet connection " +
                "and try again.",
            },
          },
        },
      });
    }

    const res = error.response;
    if (!res) {
      return Promise.reject(error);
    }

    switch (res.status) {
      case 401:
        break;
      case 403:
        if (res.data && res.data.code === "token_not_valid") {
          __ls_remove_credentials();
          localStorage.removeItem(LS_PERSIST_ROOT);
          window.location.href = "/sign-in";
        }
        break;
      default:
        break;
    }
    log("Interceptors@Status Code: " + res.status);
    return Promise.reject(error);
  }
);

const downloadFile = (file_url: string) => {
  return axiosClient.get(file_url, { responseType: "blob" });
};

export const commonClient = {
  downloadFile,
};

const signIn = (data: unknown) => {
  return axiosClient.post("/sign-in/", JSON.stringify(data));
};

const signOut = () => {
  return axiosClient.get("/sign-out/");
};

const signUp = (data: unknown) => {
  return axiosClient.post("/sign-up/", JSON.stringify(data));
};

const whoAmI = () => {
  return axiosClient.get("/verify/");
};

export const authClient = {
  signIn,
  signOut,
  signUp,
  whoAmI,
};

const getContests = (params: Record<string, unknown> | undefined) => {
  return axiosClient.get("/contest/", params && { params: { ...params } });
};
const getAllContests = (params: Record<string, unknown> | undefined) => {
  return axiosClient.get("/all-contest/", params && { params: { ...params } });
};
const getPastContests = (params: Record<string, unknown> | undefined) => {
  return axiosClient.get("/past-contest/", params && { params: { ...params } });
};

const getContest = ({ key, params }: { key: string; params?: Record<string, unknown> }) => {
  return axiosClient.get(`/contest/${key}/`, params && { params: { ...params } });
};
const joinContest = ({ key }: { key: string }) => {
  return axiosClient.post(`/contest/${key}/participate/`);
};
const leaveContest = ({ key }: { key: string }) => {
  return axiosClient.post(`/contest/${key}/leave/`);
};
const getContestStanding = ({ key, params }: { key: string; params?: Record<string, unknown> }) => {
  return axiosClient.get(`/contest/${key}/standing/`, params && { params: { ...params } });
};

const recomputeContestStanding = ({ key, params }: { key: string; params?: Record<string, unknown> }) => {
  return axiosClient.post(`/contest/${key}/standing/recompute/`, params && { params: { ...params } });
};

const getContestParticipations = ({ key, params }: { key: string; params?: Record<string, unknown> }) => {
  return axiosClient.get(`/contest/${key}/participations/`, params && { params: { ...params } });
};

const addContestParticipations = ({ key, data }: { key: string; data: unknown }) => {
  return axiosClient.post(`/contest/${key}/participations/add/`, data);
};

const actContestParticipation = ({ key, data }: { key: string; data: Record<string, unknown> }) => {
  if (!("action" in data)) throw "Expect 'action' in body";
  if (!("data" in data)) throw "Expect 'data' in body";
  return axiosClient.post(`/contest/${key}/participations/action/`, data);
};

const getContestSubmissions = ({ key, params }: { key: string; params?: Record<string, unknown> }) => {
  return axiosClient.get(`/contest/${key}/submission/`, params && { params: { ...params } });
};

const rejudgeContestSubmissions = ({ key, params }: { key: string; params?: Record<string, unknown> }) => {
  return axiosClient.patch(`/contest/${key}/submission/`, null, params && { params: { ...params } });
};

const getContestProblems = ({ key, params }: { key: string; params?: Record<string, unknown> }) => {
  return axiosClient.get(`/contest/${key}/problem/`, params && { params: { ...params } });
};

const updateContestProblems = ({ key, data }: { key: string; data: unknown }) => {
  return axiosClient.post(`/contest/${key}/problem/`, data);
};

const getContestProblem = ({
  key,
  shortname,
  params,
}: {
  key: string;
  shortname: string;
  params?: Record<string, unknown>;
}) => {
  return axiosClient.get(`/contest/${key}/problem/${shortname}/`, params && { params: { ...params } });
};

const submitContestProblem = ({
  key,
  shortname,
  data,
}: {
  key: string;
  shortname: string;
  data: unknown;
}) => {
  return axiosClient.post(`/contest/${key}/problem/${shortname}/submit/`, JSON.stringify(data));
};

const getContestParticipants = ({ key }: { key: string }) => {
  return axiosClient.get(`/contest/${key}/participants/?view_full=1`);
};

const infoRejudgeContestProblem = ({
  key,
  shortname,
  params,
}: {
  key: string;
  shortname: string;
  params?: Record<string, unknown>;
}) => {
  return axiosClient.get(`/contest/${key}/problem/${shortname}/rejudge/`, params && { params: { ...params } });
};
const rejudgeContestProblem = ({ key, shortname, data }: { key: string; shortname: string; data: unknown }) => {
  return axiosClient.post(`/contest/${key}/problem/${shortname}/rejudge/`, JSON.stringify(data));
};

const getContestProblemSubmissions = ({
  key,
  shortname,
  params,
}: {
  key: string;
  shortname: string;
  params?: Record<string, unknown>;
}) => {
  return axiosClient.get(`/contest/${key}/problem/${shortname}/submission/`, params && { params: { ...params } });
};
const getContestProblemSubmission = ({ key, shortname, id }: { key: string; shortname: string; id: string | number }) => {
  return axiosClient.get(`/contest/${key}/problem/${shortname}/submission/${id}/`);
};

const infoRateContest = ({ key }: { key: string }) => {
  return axiosClient.get(`/contest/${key}/rate/`);
};
const rateContest = ({ key, data }: { key: string; data: unknown }) => {
  return axiosClient.post(`/contest/${key}/rate/`, data);
};

const createContest = ({ data }: { data: unknown }) => {
  return axiosClient.post(`/contest/`, data);
};

const deleteContest = ({ key }: { key: string }) => {
  return axiosClient.delete(`/contest/${key}/`);
};
const updateContest = ({ key, data }: { key: string; data: unknown }) => {
  return axiosClient.patch(`/contest/${key}/`, data);
};

export const contestClient = {
  getAllContests,
  getContests,
  getPastContests,
  getContest,

  joinContest,
  leaveContest,

  getContestStanding,
  recomputeContestStanding,
  getContestSubmissions,
  rejudgeContestSubmissions,

  getContestParticipations,
  addContestParticipations,
  actContestParticipation,

  getContestParticipants,

  getContestProblems,
  getContestProblem,
  submitContestProblem,
  updateContestProblems,

  infoRejudgeContestProblem,
  rejudgeContestProblem,

  infoRateContest,
  rateContest,

  getContestProblemSubmissions,
  getContestProblemSubmission,

  createContest,
  deleteContest,
  updateContest,
};

const getJudges = (params: Record<string, unknown> | undefined) => {
  return axiosClient.get("/judge/", params && { params: { ...params } });
};
const getJudgeDetails = ({ id }: { id: string | number }) => {
  return axiosClient.get(`/judge/${id}/`);
};
const adminCreateJudge = ({ data }: { data: unknown }) => {
  return axiosClient.post(`/judge/`, data);
};
const adminEditJudge = ({ id, data }: { id: string | number; data: unknown }) => {
  return axiosClient.patch(`/judge/${id}/`, data);
};
const adminDeleteJudge = ({ id }: { id: string | number }) => {
  return axiosClient.delete(`/judge/${id}/`);
};

export const judgeClient = {
  getJudges,
  getJudgeDetails,
  adminCreateJudge,
  adminEditJudge,
  adminDeleteJudge,
};

const getOrgs = ({ slug, params }: { slug?: string; params?: Record<string, unknown> }) => {
  if (slug) return axiosClient.get(`/org/${slug}/orgs`, params && { params: { ...params } });
  else return axiosClient.get("/orgs/", params && { params: { ...params } });
};

const getAllOrgs = ({ params }: { params?: Record<string, unknown> }) => {
  return axiosClient.get("/orgs/all/", params && { params: { ...params } });
};

const getMyOrgs = () => {
  return axiosClient.get("/orgs/my/");
};

const joinOrg = ({ slug, data }: { slug: string; data: unknown }) => {
  return axiosClient.post(`/org/${slug}/membership/`, data);
};

const leaveOrg = ({ slug }: { slug: string }) => {
  return axiosClient.delete(`/org/${slug}/membership/`);
};

const createOrg = (data: unknown) => {
  return axiosClient.post(`/orgs/`, data);
};

const getOrg = ({ slug, params }: { slug: string; params?: Record<string, unknown> }) => {
  return axiosClient.get(`/org/${slug}/`, params && { params: { ...params } });
};

const updateOrg = ({ slug, data }: { slug: string; data: unknown }) => {
  return axiosClient.patch(`/org/${slug}/`, data);
};

const deleteOrg = ({ slug }: { slug: string }) => {
  return axiosClient.delete(`/org/${slug}/`);
};

const createSubOrg = ({ parentSlug, data }: { parentSlug: string; data: unknown }) => {
  return axiosClient.post(`/org/${parentSlug}/orgs/`, data);
};

const getOrgMembers = ({ slug, params }: { slug: string; params?: Record<string, unknown> }) => {
  return axiosClient.get(`/org/${slug}/members/`, params && { params: { ...params } });
};

const addOrgMembers = ({ slug, data }: { slug: string; data: unknown }) => {
  return axiosClient.post(`/org/${slug}/members/`, data);
};
const removeOrgMembers = ({ slug, data }: { slug: string; data: unknown }) => {
  return axiosClient.delete(`/org/${slug}/members/`, { data });
};

export const orgClient = {
  getOrgs,
  getMyOrgs,
  getAllOrgs,

  createOrg,
  getOrg,
  updateOrg,
  deleteOrg,
  createSubOrg,

  joinOrg,
  leaveOrg,

  getOrgMembers,
  addOrgMembers,
  removeOrgMembers,
};

const getProblems = ({ params }: { params?: Record<string, unknown> }) => {
  return axiosClient.get("/problem/", params && { params: { ...params } });
};
const createProblem = ({ data }: { data: unknown }) => {
  return axiosClient.post(`/problem/`, data);
};

const getProblemDetails = ({ shortname }: { shortname: string }) => {
  return axiosClient.get(`/problem/${shortname}/`);
};
const submitToProblem = ({ shortname, data }: { shortname: string; data: unknown }) => {
  return axiosClient.post(`/problem/${shortname}/submit/`, JSON.stringify(data));
};

const infoRejudgeProblem = ({ shortname, params }: { shortname: string; params?: Record<string, unknown> }) => {
  return axiosClient.get(`/problem/${shortname}/rejudge/`, params && { params: { ...params } });
};
const rejudgeProblem = ({ shortname, data }: { shortname: string; data: unknown }) => {
  return axiosClient.post(`/problem/${shortname}/rejudge/`, JSON.stringify(data));
};

const adminOptionsProblemDetails = ({ shortname }: { shortname: string }) => {
  return axiosClient.options(`/problem/${shortname}/`);
};
const adminPostProblemFromZip = ({ formData }: { formData: FormData }) => {
  return axiosFormClient.post(`/problem-from-archive`, formData);
};
const adminDeleteProblem = ({ shortname }: { shortname: string }) => {
  return axiosClient.delete(`/problem/${shortname}/`);
};
const adminEditProblemDetails = ({ shortname, data }: { shortname: string; data: unknown }) => {
  return axiosClient.patch(`/problem/${shortname}/`, JSON.stringify(data));
};
const adminEditProblemDetailsForm = ({ shortname, formData }: { shortname: string; formData: FormData }) => {
  return axiosFormClient.patch(`/problem/${shortname}/`, formData);
};
const adminGetProblemDetailsData = ({ shortname }: { shortname: string }) => {
  return axiosClient.get(`/problem/${shortname}/data/`);
};
const adminEditProblemDetailsData = ({ shortname, data }: { shortname: string; data: unknown }) => {
  return axiosClient.patch(`/problem/${shortname}/data/`, JSON.stringify(data));
};
const adminEditProblemDataForm = ({ shortname, formData }: { shortname: string; formData: FormData }) => {
  return axiosFormClient.patch(`/problem/${shortname}/data/`, formData);
};
const adminGetProblemDetailsTest = ({ shortname, params }: { shortname: string; params?: Record<string, unknown> }) => {
  return axiosClient.get(`/problem/${shortname}/data/test/`, params && { params: { ...params } });
};

export const problemClient = {
  getProblems,
  createProblem,

  getProblemDetails,

  submitToProblem,

  infoRejudgeProblem,
  rejudgeProblem,

  adminOptionsProblemDetails,

  adminPostProblemFromZip,

  adminGetProblemDetailsData,
  adminGetProblemDetailsTest,

  adminDeleteProblem,

  adminEditProblemDetails,
  adminEditProblemDetailsForm,
  adminEditProblemDataForm,
  adminEditProblemDetailsData,
};

const fetchProfile = () => {
  return axiosClient.get("/profile/");
};

const changePassword = (data: unknown) => {
  return axiosClient.post("/profile/change-password/", data);
};

const adminGetProfile = ({ username }: { username: string }) => {
  return axiosClient.get(`/profile/${username}/`);
};

const adminEditProfile = ({ username, data }: { username: string; data: unknown }) => {
  return axiosClient.patch(`/profile/${username}/`, data);
};

export const profileClient = {
  fetchProfile,
  changePassword,
  adminGetProfile,
  adminEditProfile,
};

const getSubmissions = (params: Record<string, unknown> | undefined) => {
  return axiosClient.get("/submission/", params && { params: { ...params } });
};

const rejudgeSubmissions = (params: Record<string, unknown> | undefined) => {
  return axiosClient.patch("/submission/", null, params && { params: { ...params } });
};

const getSubmissionDetails = ({ id, params }: { id: string | number; params?: Record<string, unknown> }) => {
  return axiosClient.get(`/submission/${id}/`, params && { params: { ...params } });
};

const adminRejudgeSubmission = ({ id }: { id: string | number }) => {
  return axiosClient.post(`/submission/${id}/rejudge/`);
};
const adminDeleteSubmission = ({ id }: { id: string | number }) => {
  return axiosClient.delete(`/submission/${id}/`);
};
const getSubmissionResult = ({ id }: { id: string | number }) => {
  return axiosClient.get(`/submission/${id}/testcase/`);
};
const getSubmissionResultCase = ({ id, case_num }: { id: string | number; case_num: string | number }) => {
  return axiosClient.get(`/submission/${id}/testcase/${case_num}/`);
};

export const submissionClient = {
  getSubmissions,
  rejudgeSubmissions,

  getSubmissionDetails,
  getSubmissionResult,
  getSubmissionResultCase,

  adminRejudgeSubmission,
  adminDeleteSubmission,
};

const getUsers = ({ params }: { params?: Record<string, unknown> }) => {
  return axiosClient.get("/users/", params && { params: { ...params } });
};
const getUser = ({ username }: { username: string }) => {
  return axiosClient.get(`/user/${username}/`);
};

const adminEditUser = ({ username, data }: { username: string; data: unknown }) => {
  return axiosClient.patch(`/user/${username}/`, data);
};

const adminActOnUsers = (payload: unknown) => {
  return axiosClient.post(`/users/act/`, payload);
};

const adminDeleteUser = ({ username }: { username: string }) => {
  return axiosClient.delete(`/user/${username}/`);
};

const adminGenUserFromCSV = ({ formData }: { formData: FormData }) => {
  return axiosFormClient.post(`/users/generate/csv/`, formData);
};

const adminResetPassword = ({ username, data }: { username: string; data: unknown }) => {
  return axiosClient.post(`/user/${username}/reset-password/`, data);
};

export const userClient = {
  getUsers,
  getUser,
  adminActOnUsers,
  adminGenUserFromCSV,
  adminEditUser,
  adminDeleteUser,
  adminResetPassword,
};