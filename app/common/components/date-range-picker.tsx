/**
 * 날짜 범위를 선택하기 위한 캘린더 컴포넌트
 * @component
 *
 * @param {Object} props
 * @param {string} props.label - 캘린더의 레이블
 * @param {string} props.description - 캘린더의 설명
 * @param {DateRange | undefined} props.value - 선택된 날짜 범위
 * @param {(range: DateRange | undefined) => void} props.onChange - 날짜 범위가 변경될 때 호출되는 함수
 * @param {number} props.minDays - 최소 선택 가능한 날짜 수
 * @param {Date} [props.minDate] - 선택 가능한 최소 날짜 (기본값: 현재 날짜)
 */

import type { DateRange } from "react-day-picker";
import { Calendar } from "~/common/components/ui/calendar";
import { Label } from "~/common/components/ui/label";

interface DateRangePickerProps {
  label: string;
  description: string;
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  minDays: number;
  minDate?: Date;
}

export function DateRangePicker({
  label,
  description,
  value,
  onChange,
  minDays,
  minDate = new Date(),
}: DateRangePickerProps) {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Label htmlFor="date" className="flex flex-col gap-px">
        {label}
        <small className="text-muted-foreground block text-center">{description}</small>
      </Label>
      <Calendar
        id="date"
        mode="range"
        selected={value}
        onSelect={onChange}
        min={minDays}
        disabled={{
          before: minDate,
        }}
      />
    </div>
  );
}
