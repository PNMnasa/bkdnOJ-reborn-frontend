import { combineReducers } from "redux";

import userReducer from "./User/reducer";
import profileReducer from "./Profile/reducer";
import contestReducer from "./Contest/reducer";

import standingFilterReducer from "./StandingFilter/reducer";
import subFilterReducer from "./SubFilter/reducer";
import recentSubmissionReducer from "./RecentSubmission/reducer";

import ranksReducer from "./Rank/reducer";
import myOrgReducer from "./MyOrg/reducer";

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
