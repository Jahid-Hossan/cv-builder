import { pageMetadata } from "../../config/site";
export const metadata = pageMetadata(
  "Resume Editor | CV Builder",
  "Edit your resume with live preview, local autosave, section ordering and PDF download.",
  "/builder",
);
import Builder from "../../components/Builder";
export default function Page() {
  return <Builder />;
}
