import axiosClient from "api/axiosClient";
import axiosFormClient from "api/axiosFormClient";

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

const problemAPI = {
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

export default problemAPI;
