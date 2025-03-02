/**
 * 이미지 업로드 입력 컴포넌트
 * @description 라벨, 설명, 이미지 미리보기 기능이 포함된 이미지 업로드 컴포넌트
 *
 * @param {Object} props
 * @param {string} props.id - 입력 필드의 고유 ID
 * @param {string} props.label - 입력 필드의 라벨
 * @param {string} props.description - 입력 필드의 설명
 * @param {string} props.name - 폼 제출시 사용될 필드명
 * @param {boolean} props.required - 필수 입력 여부
 * @param {(event: React.ChangeEvent<HTMLInputElement>) => void} props.onChange - 이미지 변경 핸들러
 * @param {string | null} props.preview - 미리보기 이미지 URL
 */
import { cn } from "~/lib/utils";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface ImagePairProps {
  id: string;
  label: string;
  description: string;
  name: string;
  required?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  preview: string | null;
  allowedTypes?: string[];
  maxSize?: string;
  shape?: "square" | "circle";
}

export function ImagePair({
  id,
  label,
  description,
  name,
  required,
  onChange,
  preview,
  allowedTypes = ["PNG", "JPG", "JPEG", "GIF", "SVG"],
  maxSize = "1MB",
  shape = "square",
}: ImagePairProps) {
  return (
    <div className="flex flex-col space-y-1.5 md:space-y-2">
      <Label htmlFor={id} className="flex flex-col gap-0.5">
        <span className="text-sm md:text-base">{label}</span>
        <small className="text-xs text-muted-foreground md:text-sm">{description}</small>
      </Label>
      {preview ? (
        <div
          className={cn(
            "mx-auto size-32 overflow-hidden rounded-lg shadow-md md:size-40 md:rounded-xl md:shadow-xl",
            shape === "circle" && "rounded-full"
          )}
        >
          <img src={preview} alt={label} className="size-full object-cover" />
        </div>
      ) : null}
      <Input
        type="file"
        accept="image/*"
        className="h-9 w-full text-sm md:h-10 md:text-base"
        id={id}
        onChange={onChange}
        required={required}
        name={name}
      />
      <div className="flex flex-col gap-0.5 text-[10px] md:text-xs">
        <span className="text-muted-foreground">허용된 이미지 형식: {allowedTypes.join(", ")}</span>
        <span className="text-muted-foreground">최대 파일 크기: {maxSize}</span>
      </div>
    </div>
  );
}
