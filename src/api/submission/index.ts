import axiosClient from "api/axiosClient";

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

const submissionApi = {
  getSubmissions,
  rejudgeSubmissions,

  getSubmissionDetails,
  getSubmissionResult,
  getSubmissionResultCase,

  adminRejudgeSubmission,
  adminDeleteSubmission,
};

export default submissionApi;
