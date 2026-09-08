import * as React from "react";

// React 19 removed the global `JSX` namespace. Legacy libs whose types still
// reference `JSX.Element` / `JSX.IntrinsicElements` (e.g. react-markdown@8,
// pulled in transitively by @uiw/react-md-editor) need it aliased back.
declare global {
  namespace JSX {
    type Element = React.JSX.Element;
    interface IntrinsicElements extends React.JSX.IntrinsicElements {}
    interface ElementClass extends React.JSX.ElementClass {}
    interface ElementAttributesProperty extends React.JSX.ElementAttributesProperty {}
    interface ElementChildrenAttribute extends React.JSX.ElementChildrenAttribute {}
  }
}