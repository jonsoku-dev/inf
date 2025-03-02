import type { InputHTMLAttributes } from "react";
import { cn } from "~/lib/utils";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

type InputPairProps = {
  label: string;
  description: string;
  textArea?: boolean;
} & InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>;

export default function InputPair({ label, description, textArea, ...props }: InputPairProps) {
  return (
    <div className="flex flex-col space-y-1.5 md:space-y-2">
      <Label htmlFor={props.id} className="flex flex-col gap-0.5">
        <span className="text-sm md:text-base">
          {label}
          {props.required && <span className="text-red-500">*</span>}
        </span>
        <small className="text-xs text-gray-500 md:text-sm">{description}</small>
      </Label>
      {textArea ? (
        <Textarea
          rows={3}
          className={cn("resize-none text-sm md:text-base md:p-3", props.className)}
          {...props}
        />
      ) : (
        <Input
          className={cn("h-9 text-sm md:h-10 md:text-base", props.className)}
          {...props}
        />
      )}
    </div>
  );
}
