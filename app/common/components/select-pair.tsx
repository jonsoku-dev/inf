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
    <div className="flex flex-col space-y-2">
      <Label htmlFor={name} className="flex flex-col gap-px" onClick={() => setOpen(true)}>
        <span>
          {label}
          {props.required && <span className="text-red-500">*</span>}
        </span>
        <small className="text-gray-500">{description}</small>
      </Label>
      <Select name={name} open={open} onOpenChange={setOpen} defaultValue={defaultValue}>
        <SelectTrigger className={cn("w-full", props)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {customRenderOption ? customRenderOption(option) : option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
