import React from "react";

import { connect } from "react-redux";
import { startPolling } from "redux/RecentSubmission/actions";

import { toast } from "react-toastify";
import { Form } from "react-bootstrap";

import { CodeEditor } from "components/CodeEditor";

import contestAPI from "api/contest";
import problemApi from "api/problem";

import { DEFAULT_LANG_SHORTNAME } from "constants/aceEditorMode";
import { __ls_get_code_editor, __ls_set_code_editor } from "helpers/localStorageHelpers";

import "helpers/importAllAceMode";
import "./SubmitForm.scss";

const SOURCE_CODE_LIMIT = 5 * 1024 * 1024;

interface Lang {
  id: number;
  name: string;
  short_name?: string;
  ace?: string;
  [key: string]: unknown;
}

interface SubmitFormProps {
  prob?: string;
  contest?: Record<string, unknown> | null;
  lang: Lang[];
  submitting: boolean;
  setSubId?: (id: number | string) => void;
  setSubErrors?: (err: string) => void;
  startPolling?: () => void;
}

interface SubmitFormState {
  code: string;
  defaultLang: Lang | null;
  selectedLang: Lang | null;
  lang: Lang[];
  id2LangMap: Record<number, Lang>;
  redirect: boolean;
  error: unknown;
}

class SubmitForm extends React.Component<SubmitFormProps, SubmitFormState> {
  constructor(props: SubmitFormProps) {
    super(props);
    let id2LangMap: Record<number, Lang> = {};
    let defaultLang: Lang | null = null;

    props.lang.forEach((lng) => {
      if (lng.short_name === DEFAULT_LANG_SHORTNAME) defaultLang = lng;
      id2LangMap[lng.id] = lng;
    });

    this.state = {
      code: "",
      defaultLang: defaultLang,
      selectedLang: defaultLang,
      lang: props.lang,
      id2LangMap,
      redirect: false,
      error: undefined,
    };
  }

  componentDidUpdate(prevProps: SubmitFormProps) {
    if (prevProps.submitting !== this.props.submitting) {
      if (prevProps.submitting === true) return;
      const source = this.state.code;

      if (source.trim().length === 0) {
        if (this.props.setSubErrors) this.props.setSubErrors("Cannot submit with an empty source code.");
        return;
      }
      if (source.trim().length > SOURCE_CODE_LIMIT) {
        if (this.props.setSubErrors)
          this.props.setSubErrors("Source code >5MB, try minify it then submit again.");
        return;
      }

      const data = {
        language: this.state.selectedLang?.id,
        source: this.state.code,
      };
      const prob = this.props.prob;
      const contest = this.props.contest;

      let endpoint: (args: Record<string, unknown>) => Promise<{ data: { id: number | string } }>;
      let conf: Record<string, unknown>;

      if (contest) {
        endpoint = contestAPI.submitContestProblem as never;
        conf = { key: (contest as { key: string }).key, shortname: prob };
      } else {
        endpoint = problemApi.submitToProblem as never;
        conf = { shortname: prob };
      }

      endpoint({ ...conf, data })
        .then((res) => {
          if (this.props.setSubId) this.props.setSubId(res.data.id);
          if (this.props.startPolling) this.props.startPolling();
        })
        .catch((err: { response?: { data?: { detail?: string } } }) => {
          if (err.response?.data?.detail) {
            toast.error(err.response.data.detail, { toastId: "submit-failed" });
            if (this.props.setSubErrors) this.props.setSubErrors(err.response.data.detail);
          }
          this.setState({ error: err.response?.data });
        });
    }
  }

  componentDidMount() {
    const data = __ls_get_code_editor();
    this.setState({ ...data });
  }

  onCodeEditorChange() {
    const data = {
      code: this.state.code,
      selectedLang: this.state.selectedLang,
    };
    __ls_set_code_editor(JSON.stringify(data));
  }

  onLangChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const lang = this.state.id2LangMap[Number(e.target.value)];
    const newLang = lang || this.state.defaultLang;
    this.setState({ selectedLang: newLang }, () => this.onCodeEditorChange());
  }

  onCodeChange(newVal: string) {
    this.setState({ code: newVal }, () => this.onCodeEditorChange());
  }

  render() {
    return (
      <Form className="submit-form">
        <Form.Group className="select-div">
          <Form.Label>Language: </Form.Label>
          <Form.Select
            onChange={(e) => this.onLangChange(e)}
            value={this.state.selectedLang?.id}
          >
            {this.state.lang.map((lng) => (
              <option key={lng.id} value={lng.id}>
                {lng.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mt-1">
          <Form.Label>Code:</Form.Label>
          <CodeEditor
            onCodeChange={(val) => this.onCodeChange(val)}
            code={this.state.code}
            ace={this.state.selectedLang?.ace}
            readOnly={this.props.submitting}
          />
        </Form.Group>
      </Form>
    );
  }
}

const mapDispatchToProps = (dispatch: (action: unknown) => void) => {
  return {
    startPolling: () => dispatch(startPolling()),
  };
};

export default connect(null, mapDispatchToProps)(SubmitForm);