import { cn } from "~/lib/utils";
import { useControlledState } from "../hooks/use-controlled-state";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";

type SelectOption = {
  label: string;
  value: string;
  metadata?: Record<string, unknown>;
};

type SelectPairProps = {
  name: string;
  label: string;
  description: string;
  required?: boolean;
  placeholder?: string;
  options: SelectOption[];
  defaultValue?: string;
  customRenderOption?: (option: SelectOption) => React.ReactNode;
};

export default function SelectPair({
  label,
  name,
  description,
  placeholder,
  options,
  defaultValue,
  customRenderOption,
  ...props
}: SelectPairProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col space-y-1.5 md:space-y-2">
      <Label htmlFor={name} className="flex flex-col gap-0.5" onClick={() => setOpen(true)}>
        <span className="text-sm md:text-base">
          {label}
          {props.required && <span className="text-red-500">*</span>}
        </span>
        <small className="text-xs text-gray-500 md:text-sm">{description}</small>
      </Label>
      <Select name={name} open={open} onOpenChange={setOpen} defaultValue={defaultValue}>
        <SelectTrigger className={cn("h-9 text-sm md:h-10 md:text-base", props)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="text-sm md:text-base">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className="py-1.5 md:py-2">
              {customRenderOption ? customRenderOption(option) : option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
