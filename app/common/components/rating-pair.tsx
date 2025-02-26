/**
 * 별점 선택을 위한 컴포넌트
 * @description 1-5까지의 별점을 선택할 수 있는 재사용 가능한 컴포넌트
 *
 * @example
 * ```tsx
 * // 제어 컴포넌트로 사용
 * <RatingPair
 *   label="Rating"
 *   description="What would you like to rate this product?"
 *   value={rating}
 *   onChange={setRating}
 * />
 *
 * // 비제어 컴포넌트로 사용
 * <RatingPair
 *   label="Rating"
 *   description="What would you like to rate this product?"
 *   defaultValue={3}
 * />
 * ```
 */

import { StarIcon } from "lucide-react";
import { Label } from "./ui/label";
import { cn } from "~/lib/utils";
import { useState } from "react";
import { useControlledState } from "../hooks/use-controlled-state";
import type { OnChange } from "../hooks/use-controlled-state";

interface RatingPairProps {
  /** 라벨 텍스트 */
  label?: string;
  /** 설명 텍스트 */
  description?: string;
  /** 현재 선택된 별점 값 (제어 컴포넌트용) */
  value?: number;
  /** 기본 별점 값 (비제어 컴포넌트용) */
  defaultValue?: number;
  /** 별점 변경 시 호출되는 콜백 함수 */
  onChange?: OnChange<number>;
  /** 필수 입력 여부 */
  required?: boolean;
  /** 추가 클래스명 */
  className?: string;
}

export default function RatingPair({
  label,
  description,
  value,
  defaultValue = 0,
  onChange,
  required = false,
  className,
}: RatingPairProps) {
  const [rating, setRating] = useControlledState<number>(value ?? defaultValue, onChange);
  const [hoveredStar, setHoveredStar] = useState<number>(0);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="flex flex-col gap-px">
          {label} {description && <small className="text-muted-foreground">{description}</small>}
        </Label>
      )}
      <div className="mt-5 flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <label
            key={star}
            htmlFor={`rating-${star}`}
            className="relative"
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
          >
            <StarIcon
              fill={hoveredStar >= star || rating >= star ? "currentColor" : "none"}
              className="size-5 text-yellow-500"
            />
            <input
              type="radio"
              id={`rating-${star}`}
              name="rating"
              value={star}
              required={required}
              className="x-px absolute h-px opacity-0"
              onChange={() => setRating(star)}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
