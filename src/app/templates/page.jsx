import { pageMetadata } from "../../config/site";
import TemplateGallery from "../../components/TemplateGallery";

export const metadata = pageMetadata(
  "15 Resume Templates | CV Builder",
  "Compare 15 resume templates and choose a layout without changing your saved content.",
  "/templates",
);

export default function Page() {
  return (
    <main className="gallery">
      <p className="eyebrow">15 WAYS TO TELL YOUR STORY</p>
      <h1>Find your fit.</h1>
      <p className="gallery-intro">
        Choose a starting point. Switch any time—your experience comes with you.
      </p>
      <TemplateGallery />
    </main>
  );
}
