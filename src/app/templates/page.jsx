import { pageMetadata } from "../../config/site";
export const metadata = pageMetadata(
  "15 Resume Templates | CV Builder",
  "Compare 15 resume templates and choose a layout without changing your saved content.",
  "/templates",
);
import TemplateGallery from "../../components/TemplateGallery";
export default function Page() {
  return <TemplateGallery />;
}
