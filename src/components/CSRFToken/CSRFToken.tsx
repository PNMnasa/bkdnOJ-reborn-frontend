import React from "react";

import { getCookie } from "helpers/cookies";

let csrftoken = getCookie("csrftoken");

const CSRFToken: React.FC = () => {
  return <input type="hidden" name="csrfmiddlewaretoken" value={csrftoken ?? ""} />;
};
export default CSRFToken;