import React from "react";

import MDEditor from "@uiw/react-md-editor";

import { getCodeString } from "rehype-rewrite";
import katex from "katex";
import "katex/dist/katex.css";
import "./RichTextEditor.css";

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
              code: (props: {
                inline?: unknown;
                children?: unknown;
                className?: string;
                node?: unknown;
              }) => {
                const inline = !!props.inline;
                const className = props.className;
                const children = Array.isArray(props.children)
                  ? (props.children as unknown[])
                  : [props.children];
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
                  return <code>{txt as React.ReactNode}</code>;
                }
                const nodeChildren = (
                  props.node as { children?: unknown } | undefined
                )?.children;
                const code = nodeChildren
                  ? getCodeString(
                      nodeChildren as Parameters<typeof getCodeString>[0]
                    )
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
                return <code className={String(className)}>{txt as React.ReactNode}</code>;
              },
            },
          }}
        />
      </div>
    );
  }
}