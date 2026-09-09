import { combineReducers } from "redux";

import userReducer from "./User";
import profileReducer from "./Profile";
import contestReducer from "./Contest";

import standingFilterReducer from "./StandingFilter";
import subFilterReducer from "./SubFilter";
import recentSubmissionReducer from "./RecentSubmission";

import ranksReducer from "./Rank";
import myOrgReducer from "./MyOrg";

const rootReducer = combineReducers({
  user: userReducer,
  profile: profileReducer,
  contest: contestReducer,
  recentSubmission: recentSubmissionReducer,
  subFilter: subFilterReducer,
  standingFilter: standingFilterReducer,
  ranks: ranksReducer,
  myOrg: myOrgReducer,
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;
