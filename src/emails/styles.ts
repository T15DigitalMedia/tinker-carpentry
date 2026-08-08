import type { CSSProperties } from "react";

// Inline styles only — email clients don't run a CSS engine, so this can't
// reach for Tailwind classes or the app's CSS custom properties. Values are
// hand-copied from the design tokens in globals.css.
export const emailStyles = {
  body: {
    margin: 0,
    padding: "32px 16px",
    backgroundColor: "#e7e3d7",
    fontFamily: "Georgia, 'Times New Roman', serif",
    color: "#182634",
  } satisfies CSSProperties,
  container: {
    maxWidth: 480,
    margin: "0 auto",
    backgroundColor: "#f1eee5",
    border: "1px solid #c2bba9",
    borderRadius: 10,
    padding: "32px 28px",
  } satisfies CSSProperties,
  heading: {
    margin: "0 0 4px",
    fontSize: 22,
    fontWeight: 600,
    color: "#182634",
  } satisfies CSSProperties,
  orderRef: {
    margin: "0 0 24px",
    fontSize: 12,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#6c7a88",
  } satisfies CSSProperties,
  paragraph: {
    margin: "0 0 20px",
    fontSize: 15,
    lineHeight: 1.6,
    color: "#42546a",
  } satisfies CSSProperties,
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: 20,
  } satisfies CSSProperties,
  itemCell: {
    padding: "10px 0",
    borderBottom: "1px solid #c2bba9",
    fontSize: 14,
    color: "#182634",
    textAlign: "left",
  } satisfies CSSProperties,
  itemPriceCell: {
    padding: "10px 0",
    borderBottom: "1px solid #c2bba9",
    fontSize: 14,
    color: "#42546a",
    textAlign: "right",
  } satisfies CSSProperties,
  leadTimeNote: {
    margin: "2px 0 0",
    fontSize: 12,
    color: "#a9711a",
  } satisfies CSSProperties,
  totalsLabel: {
    padding: "4px 0",
    fontSize: 13,
    color: "#6c7a88",
    textAlign: "left",
  } satisfies CSSProperties,
  totalsValue: {
    padding: "4px 0",
    fontSize: 13,
    color: "#42546a",
    textAlign: "right",
  } satisfies CSSProperties,
  totalLabel: {
    padding: "10px 0 0",
    fontSize: 14,
    fontWeight: 600,
    color: "#182634",
    textAlign: "left",
    borderTop: "1px solid #c2bba9",
  } satisfies CSSProperties,
  totalValue: {
    padding: "10px 0 0",
    fontSize: 14,
    fontWeight: 600,
    color: "#182634",
    textAlign: "right",
    borderTop: "1px solid #c2bba9",
  } satisfies CSSProperties,
  footer: {
    margin: "24px 0 0",
    fontSize: 12,
    color: "#6c7a88",
  } satisfies CSSProperties,
} as const;
