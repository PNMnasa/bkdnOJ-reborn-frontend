import React from "react";

import { Link } from "react-router-dom";
import { Row, Col } from "react-bootstrap";

import { FaUniversity } from "react-icons/fa";

import { UserCard } from "components";

interface AboutTabProps {
  profile: {
    username: string;
    rating: number;
    avatar: string;
    first_name: string;
    last_name: string;
    full_name: string;
    problem_count: number;
    points: number;
    about: string;
    organization?: { slug: string; name: string; logo_url?: string };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface AboutTabState {
  displayMode: string;
}

class AboutTab extends React.Component<AboutTabProps, AboutTabState> {
  constructor(props: AboutTabProps) {
    super(props);
    this.state = {
      displayMode: "user",
    };
  }

  togglePreviewDisplayMode() {
    let mode = "user";
    if (this.state.displayMode === "user") mode = "org";
    this.setState({ displayMode: mode });
  }

  render() {
    const { profile } = this.props;
    const userData4UserCard = {
      username: profile.username,
      rating: profile.rating,
      avatar: profile.avatar,
      first_name: profile.first_name,
      last_name: profile.last_name,
    };

    return (
      <div className="section about-wrapper">
        <div className="name-and-org">
          <div className="full-name">{profile.full_name}</div>
          {profile.organization && (
            <div className="disp-org d-inline-flex" style={{ alignItems: "center" }}>
              <FaUniversity />
              <Link to={`/org/${profile.organization.slug}`}>{profile.organization.name}</Link>
            </div>
          )}
        </div>

        <Row className="mt-3 details">
          <Col sm={6}>
            <ul>
              <li>
                <strong>Problems Solved: </strong>
                {profile.problem_count}
              </li>
              <li>
                <strong>Points: </strong>
                {profile.points}
              </li>
              <li>
                <strong>Rating:</strong> {profile.rating ? profile.rating : <em>?</em>}
              </li>
            </ul>
          </Col>{" "}
          <Col>
            <div className="border">
              <UserCard
                user={userData4UserCard}
                organization={profile.organization}
                displayMode={this.state.displayMode}
              />
            </div>
            <p className="switch-view">You will look like this on Scoreboard.</p>
            <p className="switch-view">
              <Link to="#" onClick={() => this.togglePreviewDisplayMode()}>
                {"> Switch view"}
              </Link>
            </p>
          </Col>
        </Row>

        <hr />
        <h5>About</h5>
        <div className="about-me">{profile.about}</div>
      </div>
    );
  }
}

export default AboutTab;