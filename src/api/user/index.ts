import axiosClient from "api/axiosClient";
import axiosFormClient from "api/axiosFormClient";

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

const userAPI = {
  getUsers,
  getUser,
  adminActOnUsers,
  adminGenUserFromCSV,
  adminEditUser,
  adminDeleteUser,
  adminResetPassword,
};

export default userAPI;
