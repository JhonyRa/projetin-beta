import * as React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, ...props }, ref) => {
    return (
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          ref={ref}
          className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
          {...props}
        />
        {label && <span className="ml-2">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox"; 