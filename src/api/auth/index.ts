import axiosClient from "api/axiosClient";

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

const AuthAPI = {
  signIn,
  signOut,
  signUp,
  whoAmI,
};

export default AuthAPI;
