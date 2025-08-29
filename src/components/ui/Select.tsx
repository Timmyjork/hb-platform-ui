import { type SelectHTMLAttributes, forwardRef } from "react";

type Option = { label: string; value: string };

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  items?: Option[]; // optional helper to auto-render options
}

const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, error, items, children, className = "", ...rest },
  ref
) {
  const base =
    "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black";
  return (
    <label className="flex flex-col gap-1">
      {label ? <span className="text-sm font-medium">{label}</span> : null}
      <select ref={ref} {...rest} className={`${base} ${className}`}>
      {children ?? items?.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
      </select>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
});

export default Select;
