import axiosClient from "api/axiosClient";

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

const contestAPI = {
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

export default contestAPI;
