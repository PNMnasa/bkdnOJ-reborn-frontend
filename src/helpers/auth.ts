export const isLoggedIn = (user: unknown): user is object => {
  if (user) return true;
  return false;
};

export const isStaff = (user: { is_staff?: boolean } | null | undefined): boolean => {
  return isLoggedIn(user) && !!user.is_staff;
};

export const isSuperUser = (user: { is_superuser?: boolean } | null | undefined): boolean => {
  return isLoggedIn(user) && !!user.is_superuser;
};