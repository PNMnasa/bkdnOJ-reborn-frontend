import axiosClient from "api/axiosClient";

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

const judgeAPI = {
  getJudges,
  getJudgeDetails,
  adminCreateJudge,
  adminEditJudge,
  adminDeleteJudge,
};

export default judgeAPI;
