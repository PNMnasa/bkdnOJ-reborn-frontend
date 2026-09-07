import React from "react";

import loader from "assets/common/loading.gif";

interface SpinLoaderProps {
  size?: number | string;
  margin?: string;
  className?: string;
}

export default class SpinLoader extends React.Component<SpinLoaderProps> {
  constructor(props: SpinLoaderProps) {
    super(props);
    this.state = {
      size: props.size || "20px",
      margin: props.margin || "0 10px",
      className: props.className,
    };
  }

  render() {
    const { size, margin, className } = this.state as { size: number | string; margin: string; className?: string };
    return (
      <img
        src={loader}
        style={{ width: String(size), height: String(size), margin }}
        className={className}
        alt="..."
      />
    );
  }
}