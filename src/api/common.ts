import axiosClient from "api/axiosClient";

const downloadFile = (file_url: string) => {
  return axiosClient.get(file_url, { responseType: "blob" });
};

const commonAPI = {
  downloadFile,
};

export default commonAPI;
