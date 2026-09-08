import { useNavigate } from "react-router";
import type { ComponentType } from "react";

export const wrapNavigate = <P extends object>(Component: ComponentType<P & { navigate: ReturnType<typeof useNavigate> }>) => {
  const Wrapper = (props: P) => {
    const navigate = useNavigate();

    return <Component navigate={navigate} {...props} />;
  };

  return Wrapper;
};
