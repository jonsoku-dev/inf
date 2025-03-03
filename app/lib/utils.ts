import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 숫자를 통화 형식으로 포맷팅합니다.
 * @param amount 금액
 * @returns 포맷팅된 금액 문자열 (예: ₩100,000)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * 날짜 문자열을 한국어 형식으로 포맷팅합니다.
 * @param dateString ISO 형식의 날짜 문자열
 * @param format 포맷 옵션 (기본값: 'full', 'MM/DD' 등 지정 가능)
 * @returns 포맷팅된 날짜 문자열 (예: 2023년 1월 1일)
 */
export function formatDate(dateString: string, format: string = 'full'): string {
  if (!dateString) return '';

  const date = new Date(dateString);

  if (format === 'MM/DD') {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  if (format === 'YYYY-MM-DD') {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  if (format === 'time') {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  if (format === 'datetime') {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  // 기본 포맷 (full)
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}
