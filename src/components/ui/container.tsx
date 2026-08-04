import { type ReactNode } from "react";

export function Container({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-(--ui-maxw) px-5 sm:px-8">{children}</div>;
}
