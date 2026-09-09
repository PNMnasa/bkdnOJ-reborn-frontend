import { Link } from "react-router";
import { FaQuestion } from "components/icons";


export function qmClarify(msg: string) {
  return (
    <Link className="qm-clarify" to="#" onClick={() => alert(msg)}>
      <FaQuestion />
    </Link>
  );
}
