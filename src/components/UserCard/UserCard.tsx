import React from "react";
import { connect } from "react-redux";
import type { AnyAction } from "redux";

import { AiFillHeart, AiOutlineHeart, FaUniversity } from "components/icons";



import defaultOrgImg from "assets/images/default-org.png";

import "./UserCard.css";
import { toggleTeamFavorite } from "../../redux/StandingFilter/action";

interface UserShape {
  username?: string;
  rating?: number;
  avatar?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  organization?: { slug?: string; short_name?: string; name?: string; logo_url?: string };
  [key: string]: unknown;
}

interface Rank {
  rank: string;
  rating_floor: number;
  rank_class: string;
}

interface UserCardProps {
  user: UserShape;
  displayMode?: string;
  organization?: { slug?: string; short_name?: string; name?: string; logo_url?: string };
  isFavorite?: boolean;
  contestId?: string;
  ranks: Rank[];
  toggleFavorite: (data: { contestId: string; teamName: string; isFavorite: boolean }) => void;
}

class UserCard extends React.Component<UserCardProps> {
  static findRankByRating(rating: number | undefined, ranks: Rank[]): Rank {
    if (!rating)
      return {
        rank: "Unrated",
        rating_floor: 0,
        rank_class: "rate-unrated",
      };

    let lo = 0,
      hi = ranks.length - 1;
    let ans = 0;
    while (lo <= hi) {
      let mid = Math.floor((lo + hi) / 2);
      if (ranks[mid].rating_floor <= rating) {
        ans = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return ranks[ans];
  }

  render() {
    const { user, displayMode, organization } = this.props;
    const { isFavorite, contestId } = this.props;

    const rank_obj = UserCard.findRankByRating(user.rating, this.props.ranks);

    const orgImg = (organization && organization.logo_url) || defaultOrgImg || null;
    const orgName = (organization && (organization.short_name || organization.slug)) || null;

    let realname = "";
    [user.first_name, user.last_name].forEach((st) => {
      if (!st) return;
      if (realname) realname += " ";
      realname += st;
    });

    let orgTooltipTitle = organization?.name;
    if (displayMode === "org" && !orgName) {
      orgTooltipTitle = "This user hasn't set their Display Organization.";
    }

    const onFavoriteClick = () => {
      this.props.toggleFavorite({
        contestId: contestId || "",
        teamName: user.username || "",
        isFavorite: !isFavorite,
      });
    };

    return (
      <div className="flex-center participant-container" style={{ justifyContent: "center" }}>
        <div className="avatar-container">
          {displayMode === "user" ? (
            <img className="avatar-img" src={user.avatar} alt="User Icon" />
          ) : (
            <img className="avatar-img" src={orgImg || undefined} alt="Org Icon" />
          )}
        </div>
        <div className="flex-center-col user-container">
          <div className="participant-name-wrapper">
            <div
              className="acc-username text-truncate"
              data-toggle="tooltip"
              data-placement="right"
              title={`${rank_obj.rank} ${user.username}`}
            >
              <p className={`${rank_obj.rank_class} username relative`}>{user.username}</p>
            </div>
            {isFavorite ? (
              <AiFillHeart
                title="Favorite team/user"
                data-toogle="tooltip"
                data-placement="right"
                className="favorite-icon text-danger"
                onClick={onFavoriteClick}
                size={20}
              />
            ) : (
              <AiOutlineHeart
                title="Mark as favorite"
                data-toogle="tooltip"
                data-placement="right"
                className="favorite-icon"
                onClick={onFavoriteClick}
                size={20}
              />
            )}
          </div>

          {realname.length > 0 && (
            <div className="text-left acc-realname text-truncate">{realname}</div>
          )}
          {displayMode === "org" && (
            <div
              className="text-left acc-org text-truncate"
              data-toggle="tooltip"
              data-placement="right"
              title={orgTooltipTitle}
            >
              {orgName ? (
                <>
                  <FaUniversity /> {orgName}
                </>
              ) : (
                "None"
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: { ranks: { ranks: Rank[] } }) => {
  return {
    ranks: state.ranks.ranks,
  };
};

const mapDispatchToProps = (dispatch: (action: AnyAction) => void) => {
  return {
    toggleFavorite: ({ contestId, teamName, isFavorite }: { contestId: string; teamName: string; isFavorite: boolean }) =>
      dispatch(
        toggleTeamFavorite({
          contestId,
          teamName,
          isFavorite,
        })
      ),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserCard) as React.ComponentType<any>;