import React, { Suspense, lazy } from "react";
import { useSelector } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";

import { ListSidebar, OneColumn } from "layout";

import {
  Content,
  SpinLoader,
  SubFilterSidebar,
  RecentSubmissionSidebar,
} from "components";

import UserApp from "pages/user/UserApp";
import AdminApp from "pages/admin/AdminApp";

import "App.css";

const SignIn = lazy(() => import("pages/user-auth/SignIn/SignIn"));
const SignUp = lazy(() => import("pages/user-auth/SignUp/SignUp"));
const SignOut = lazy(() => import("pages/user-auth/SignOut/SignOut"));
const UserProfile = lazy(() => import("pages/user/user-profile/UserProfile"));

const SubmissionList = lazy(() => import("pages/user/submission/SubmissionList"));
const SubmissionDetails = lazy(() =>
  import("pages/user/submission/SubmissionDetails")
);
const ProblemList = lazy(() => import("pages/user/problem/List"));
const ProblemDetails = lazy(() => import("pages/user/problem/ProblemDetails"));
const JudgeStatuses = lazy(() =>
  import("pages/user/judge-status/JudgeStatuses")
);
const ContestList = lazy(() => import("pages/user/contest/List"));
const ContestApp = lazy(() => import("pages/user/contest/ContestApp"));
const ContestStanding = lazy(() =>
  import("pages/user/contest/_/ContestStanding")
);
const ContestAbout = lazy(() => import("pages/user/contest/_/ContestAbout"));
const OrgList = lazy(() => import("pages/user/organization/List"));
const OrgDetail = lazy(() => import("pages/user/organization/Detail"));

const AdminUserList = lazy(() => import("pages/admin/user/List"));
const AdminUserDetails = lazy(() => import("pages/admin/user/Details"));
const AdminUserNew = lazy(() => import("pages/admin/user/New"));
const AdminProblemList = lazy(() => import("pages/admin/problem/AdminProblemList"));
const AdminProblemDetails = lazy(() =>
  import("pages/admin/problem/AdminProblemDetails")
);
const AdminSubmissionList = lazy(() => import("pages/admin/submission/List"));
const AdminSubmissionDetails = lazy(() =>
  import("pages/admin/submission/Details")
);
const AdminJudgeList = lazy(() => import("pages/admin/judge/List"));
const AdminJudgeDetails = lazy(() => import("pages/admin/judge/Details"));
const AdminJudgeNew = lazy(() => import("pages/admin/judge/New"));
const AdminContestList = lazy(() => import("pages/admin/contest/List"));
const AdminContestDetails = lazy(() => import("pages/admin/contest/Details"));
const AdminContestNew = lazy(() => import("pages/admin/contest/New"));
const AdminOrgList = lazy(() => import("pages/admin/org/List"));
const AdminOrgDetails = lazy(() => import("pages/admin/org/Details"));

const Loading = () => (
  <div className="d-flex justify-content-center py-5">
    <SpinLoader />
  </div>
);

interface AuthUser {
  is_staff?: boolean;
  is_superuser?: boolean;
  [key: string]: unknown;
}

interface PageMessageProps {
  title: string;
  minHeight?: number;
  minWidth?: number;
}

const PageMessage = ({title, minHeight, minWidth}: PageMessageProps) => (
  <div
    className="shadow text-dark d-flex flex-column justify-content-center text-center"
    style={{minHeight, minWidth}}
  >
    <h4>{title}</h4>
  </div>
);

const oneColumn = (mainContent: React.ReactNode) => (
  <OneColumn mainContent={mainContent} />
);

const listSidebar = (
  mainContent: React.ReactNode,
  sideComponents: React.ReactNode[]
) => (
  <ListSidebar mainContent={mainContent} sideComponents={sideComponents} />
);

const adminRoutes = () => [
  <Route key="/admin" path="/admin" element={<AdminApp />}>
      <Route
        index
        path=""
        element={<PageMessage title="Admin Home Page" minHeight={400} />}
      />

      <Route path="users" element={oneColumn(<AdminUserList />)} />
      <Route path="users/new" element={oneColumn(<AdminUserNew />)} />
      <Route path="user/:username" element={oneColumn(<AdminUserDetails />)} />

      <Route path="orgs" element={oneColumn(<AdminOrgList />)} />
      <Route path="org/:slug" element={oneColumn(<AdminOrgDetails />)} />

      <Route path="problems" element={oneColumn(<AdminProblemList />)} />
      <Route
        path="problem/:shortname"
        element={oneColumn(<AdminProblemDetails />)}
      />

      <Route path="submissions" element={oneColumn(<AdminSubmissionList />)} />
      <Route
        path="submission/:id"
        element={oneColumn(<AdminSubmissionDetails />)}
      />

      <Route path="contests" element={oneColumn(<AdminContestList />)} />
      <Route path="contests/new" element={oneColumn(<AdminContestNew />)} />
      <Route
        path="contest/:key"
        element={oneColumn(<AdminContestDetails />)}
      />

      <Route path="judges" element={oneColumn(<AdminJudgeList />)} />
      <Route path="judge/new" element={oneColumn(<AdminJudgeNew />)} />
      <Route path="judge/:id" element={oneColumn(<AdminJudgeDetails />)} />

      <Route path="*" element={<PageMessage title="Not Implemented" minHeight={400} />} />
    </Route>
];

const userRoutes = (isAuthenticated: boolean) => [
  <Route key="user-root" path="" element={<UserApp />}>
      <Route index path="/" element={<Content />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/profile" element={<UserProfile />} />

      {isAuthenticated ? (
        <Route path="/sign-out" element={<SignOut />} />
      ) : (
        <Route path="/sign-up" element={<SignUp />} />
      )}

      <Route path="/problems" element={oneColumn(<ProblemList />)} />
      <Route
        path="/problem/:shortname"
        element={oneColumn(<ProblemDetails />)}
      />

      <Route
        path="/submissions"
        element={listSidebar(<SubmissionList />, [
          <SubFilterSidebar key="SubFilterSidebar" />,
        ])}
      />
      <Route
        path="/submission/:id"
        element={oneColumn(<SubmissionDetails />)}
      />

      <Route path="/orgs" element={oneColumn(<OrgList />)} />
      <Route path="/org/:slug" element={oneColumn(<OrgDetail />)} />

      <Route path="/contests" element={oneColumn(<ContestList />)} />

      <Route path="/contest/:key" element={<ContestApp />}>
        <Route path="about" element={oneColumn(<ContestAbout />)} />
        <Route
          path="problem"
          element={listSidebar(<ProblemList />, [
            <RecentSubmissionSidebar key="RecentSubmissionSidebar" />,
          ])}
        />
        <Route
          path="problem/:shortname"
          element={listSidebar(<ProblemDetails />, [
            <RecentSubmissionSidebar key="RecentSubmissionSidebar" />,
          ])}
        />
        <Route
          path="submission"
          element={listSidebar(<SubmissionList />, [
            <SubFilterSidebar key="SubFilterSidebar" />,
            <RecentSubmissionSidebar key="RecentSubmissionSidebar" />,
          ])}
        />
        <Route
          path="submission/:id"
          element={listSidebar(<SubmissionDetails />, [
            <RecentSubmissionSidebar key="RecentSubmissionSidebar" />,
          ])}
        />
        <Route path="standing" element={<ContestStanding />} />
        <Route path="" element={<Navigate to="about" replace />} />
        <Route path="*" element={<Navigate to="about" replace />} />
      </Route>

      <Route path="/status" element={oneColumn(<JudgeStatuses />)} />

      <Route
        path="/404"
        element={<PageMessage title="404 | Page Not Found" minHeight={200} minWidth={400} />}
      />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Route>
];

const App = () => {
  const user = useSelector<{ user: { user: AuthUser | null } }, AuthUser | null>(
    (state) => state.user.user
  );

  const isAuthenticated = !!user;
  const isAdmin =
    isAuthenticated && (!!user?.is_staff || !!user?.is_superuser);

  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {isAdmin && adminRoutes()}
          {userRoutes(isAuthenticated)}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;