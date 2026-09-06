import axiosClient from "api/axiosClient";

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

const ProfileAPI = {
  fetchProfile,
  changePassword,
  adminGetProfile,
  adminEditProfile,
};

export default ProfileAPI;
