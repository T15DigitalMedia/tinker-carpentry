import { type ReactNode } from "react";

export function Container({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[1080px] px-5">{children}</div>;
}
