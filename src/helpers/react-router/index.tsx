import ScrollToTop from "./ScrollToTop";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import type { ComponentType } from "react";

function withNavigation<P extends object>(Component: ComponentType<P & { navigate: ReturnType<typeof useNavigate> }>) {
  return (props: P) => <Component {...props} navigate={useNavigate()} />;
}

function withParams<P extends object>(Component: ComponentType<P & { params: ReturnType<typeof useParams> }>) {
  return (props: P) => <Component {...props} params={useParams()} />;
}

function withLocation<P extends object>(Component: ComponentType<P & { location: ReturnType<typeof useLocation> }>) {
  return (props: P) => <Component {...props} location={useLocation()} />;
}

export { ScrollToTop, withNavigation, withParams, withLocation };
