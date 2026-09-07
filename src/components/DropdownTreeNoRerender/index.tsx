import { Component } from "react";
import DropdownTreeSelect from "react-dropdown-tree-select";
import isEqual from "lodash/isEqual";

interface DropdownTreeNoRerenderProps {
  data: unknown;
  [key: string]: unknown;
}

export default class DropdownTreeNoRerender extends Component<DropdownTreeNoRerenderProps> {
  constructor(props: DropdownTreeNoRerenderProps) {
    super(props);
    this.state = { data: props.data };
  }

  componentDidUpdate = (prevProps: DropdownTreeNoRerenderProps, prevState: { data: unknown }) => {
    if (!isEqual(this.props.data, this.state.data)) {
      this.setState({ data: this.props.data });
    }
  };

  shouldComponentUpdate = (nextProps: DropdownTreeNoRerenderProps) => {
    return !isEqual(nextProps.data, this.state.data);
  };

  render() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, ...rest } = this.props;
    return <DropdownTreeSelect data={this.state.data} {...rest} />;
  }
}