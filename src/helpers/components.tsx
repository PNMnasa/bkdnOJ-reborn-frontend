import { Link } from "react-router-dom";
import { FaQuestion } from "react-icons/fa";

export function qmClarify(msg: string) {
  return (
    <Link className="qm-clarify" to="#" onClick={() => alert(msg)}>
      <FaQuestion />
    </Link>
  );
}
