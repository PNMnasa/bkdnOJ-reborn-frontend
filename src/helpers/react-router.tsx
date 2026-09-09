// https://stackoverflow.com/a/61602724/13020109
// ScrollToTop helps scroll to top every time ReactRouter
// make a transition
import { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import type { ComponentType } from "react";

export function ScrollToTop(): null {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function withNavigation<P extends object>(Component: ComponentType<P & { navigate: ReturnType<typeof useNavigate> }>) {
  return (props: P) => <Component {...props} navigate={useNavigate()} />;
}

function withParams<P extends object>(Component: ComponentType<P & { params: ReturnType<typeof useParams> }>) {
  return (props: P) => <Component {...props} params={useParams()} />;
}

function withLocation<P extends object>(Component: ComponentType<P & { location: ReturnType<typeof useLocation> }>) {
  return (props: P) => <Component {...props} location={useLocation()} />;
}

export { withNavigation, withParams, withLocation };