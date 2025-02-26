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
    <div className="flex flex-col space-y-2">
      <Label htmlFor={props.id} className="flex flex-col gap-px">
        <span>
          {label}
          {props.required && <span className="text-red-500">*</span>}
        </span>
        <small className="text-gray-500">{description}</small>
      </Label>
      {textArea ? (
        <Textarea rows={4} className={cn("resize-none", props.className)} {...props} />
      ) : (
        <Input {...props} />
      )}
    </div>
  );
}
