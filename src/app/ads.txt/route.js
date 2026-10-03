import { siteConfig, validAdsenseId } from "../../config/site";
export const dynamic = "force-static";
export function GET() {
  const content = validAdsenseId(siteConfig.adsenseClientId)
    ? `google.com, ${siteConfig.adsenseClientId.replace("ca-", "")}, DIRECT, f08c47fec0942fa0\n`
    : "# AdSense is not configured. Replace pub-XXXXXXXXXXXXXXXX with your real publisher ID via NEXT_PUBLIC_ADSENSE_CLIENT_ID and rebuild.\n";
  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
