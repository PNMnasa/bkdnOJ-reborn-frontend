import React from "react";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import { modesByName } from "ace-builds/src-noconflict/ext-modelist";
import "helpers/importAllAceMode";

import { FALLBACK_ACE_MODE } from "constants/aceEditorMode";

interface CodeEditorProps {
  onCodeChange?: (val: string) => void;
  code?: string;
  ace?: string;
  readOnly?: boolean;
}

export default class CodeEditor extends React.Component<CodeEditorProps> {
  getAceMode() {
    return this.props.ace && modesByName[this.props.ace]
      ? this.props.ace
      : FALLBACK_ACE_MODE;
  }

  render() {
    return (
      <AceEditor
        mode={this.getAceMode()}
        theme="github"
        onChange={(val) => this.props.onCodeChange && this.props.onCodeChange(val)}
        value={this.props.code}
        name="sub-source-code-editor"
        editorProps={{ $blockScrolling: true }}
        style={styles.ace}
        readOnly={!!this.props.readOnly}
      />
    );
  }
}

const styles = {
  ace: {
    width: "100%",
    overflow: "auto",
  },
};