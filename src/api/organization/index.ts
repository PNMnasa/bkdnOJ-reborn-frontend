import axiosClient from "api/axiosClient";

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

const orgAPI = {
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

export default orgAPI;
