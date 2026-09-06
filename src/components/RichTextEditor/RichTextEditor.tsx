import React from "react";

import MDEditor from "@uiw/react-md-editor";

import { getCodeString } from "rehype-rewrite";
import katex from "katex";
import "katex/dist/katex.css";
import "./RichTextEditor.scss";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value?: string) => void;
  enableEdit?: boolean;
  [key: string]: unknown;
}

export default class RichTextEditor extends React.Component<RichTextEditorProps> {
  render() {
    let enableEdit = this.props.enableEdit || false;
    return (
      <div className="rich-text-editor" data-color-mode="light">
        <div className="wmde-markdown-var"> </div>
        <MDEditor
          value={this.props.value}
          onChange={this.props.onChange}
          preview={enableEdit ? "live" : "preview"}
          hideToolbar={enableEdit ? false : true}
          height={enableEdit ? 200 : 600}
          {...this.props}
          previewOptions={{
            components: {
              code: ({ inline, children = [], className, ...props }) => {
                const txt = children[0] || "";
                if (inline) {
                  if (typeof txt === "string" && /^\$\$(.*)\$\$/.test(txt)) {
                    const html = katex.renderToString(
                      txt.replace(/^\$\$(.*)\$\$/, "$1"),
                      {
                        throwOnError: false,
                      }
                    );
                    return <code dangerouslySetInnerHTML={{ __html: html }} />;
                  }
                  return <code>{txt}</code>;
                }
                const code =
                  props.node && props.node.children
                    ? getCodeString(props.node.children)
                    : txt;
                if (
                  typeof code === "string" &&
                  typeof className === "string" &&
                  /^language-katex/.test(className.toLocaleLowerCase())
                ) {
                  const html = katex.renderToString(code, {
                    throwOnError: false,
                  });
                  return (
                    <code style={{ fontSize: "150%" }} dangerouslySetInnerHTML={{ __html: html }} />
                  );
                }
                return <code className={String(className)}>{txt}</code>;
              },
            },
          }}
        />
      </div>
    );
  }
}