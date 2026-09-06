import React, { Component } from "react";
import type { ReactNode, MouseEvent } from "react";

/**
 * https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
 * Wrapper component that do something (or alerts by default) if you click outside of it
 *
 * params:
 *    - outsideClickHandler -> func: function to execute when clicked outside
 *    - isDetecting -> bool: if it is true, execute outsideClickHandler() if clicked outside
 *    - children -> ReactComponent: child prop of wrapper
 */

interface OutsideAlerterProps {
  outsideClickHandler?: () => void;
  isDetecting?: boolean;
  children: ReactNode;
}

export default class OutsideAlerter extends Component<OutsideAlerterProps> {
  wrapperRef: React.RefObject<HTMLDivElement>;
  outsideClickHandler?: () => void;

  constructor(props: OutsideAlerterProps) {
    super(props);

    this.wrapperRef = React.createRef<HTMLDivElement>();
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.outsideClickHandler = this.props.outsideClickHandler;
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside as EventListener);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside as EventListener);
  }

  /**
   * Alert if clicked on outside of element
   */
  handleClickOutside(event: MouseEvent) {
    if (!this.props.isDetecting) return;
    if (this.wrapperRef && !this.wrapperRef.current?.contains(event.target as Node)) {
      if (this.outsideClickHandler) this.outsideClickHandler();
      else
        alert("You clicked outside of me! Please set outsideClickHandler to do something.");
    }
  }

  render() {
    return <div ref={this.wrapperRef}>{this.props.children}</div>;
  }
}
