import React from "react";
import type { ReactNode } from "react";

import "./OneColumn.scss";

interface OneColumnProps {
  mainContent?: ReactNode | ReactNode[];
}

export default class OneColumn extends React.Component<OneColumnProps> {
  render() {
    let mainContent = this.props.mainContent;
    if (!mainContent) {
      mainContent = [];
    }
    if (!(mainContent instanceof Array)) mainContent = [mainContent];

    return (
      <div className="one-column-wrapper">
        {mainContent.map((content, idx) => (
          // TODO: Would multiple OneColumn layout affects each others?
          //       Because there would be multiple div with the same key?
          <div
            key={`one-col-${idx}`}
            className="one-column-element"
            id={`one-column-element-i-${idx}`}
          >
            {content}
          </div>
        ))}
      </div>
    );
  }
}