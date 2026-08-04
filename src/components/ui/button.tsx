import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

const base =
  "inline-flex items-center justify-center rounded-ui px-5 py-2.5 text-sm font-medium transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-50 disabled:pointer-events-none disabled:translate-y-0 disabled:shadow-none";

const variants = {
  primary:
    "bg-walnut text-paper shadow-ui-sm hover:bg-walnut-2 hover:shadow-ui-md hover:-translate-y-0.5",
  secondary:
    "border border-line-strong text-ink bg-paper hover:bg-ink hover:text-paper hover:border-ink hover:-translate-y-0.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${className}`}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
