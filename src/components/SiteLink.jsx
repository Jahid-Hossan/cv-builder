import Link from "next/link";
// A fresh document discards optional scripts before any saved resume is rendered.
export default function SiteLink({ href, children, ...props }) {
  if (
    typeof href === "string" &&
    ["/builder", "/templates"].includes(href.split(/[?#]/)[0].replace(/\/+$/, ""))
  ) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}
