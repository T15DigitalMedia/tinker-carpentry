import { SITE_NAME, SITE_URL } from "@/lib/site";
import { emailStyles as s } from "./styles";

export function TrackOrderFooter() {
  return (
    <>
      <p style={s.footer}>
        Track your order anytime at{" "}
        <a href={`${SITE_URL}/track`} style={s.link}>
          {SITE_URL.replace(/^https?:\/\//, "")}/track
        </a>
        .
      </p>
      <p style={s.footer}>{SITE_NAME}</p>
    </>
  );
}
