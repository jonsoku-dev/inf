import { useState } from "react";

// Either use the callback `setState` signature or just a "void"
export type OnChange<T> = (v: React.SetStateAction<T>) => T | void;
type StateUpdater<T> = (v: T) => T;

/**
 * 제어/비제어 컴포넌트 상태를 관리하는 훅
 * @template TState - 상태 값의 타입
 * @template TOnChange - onChange 핸들러의 타입
 * @param {TState} value - 초기값 또는 제어된 값
 * @param {TOnChange} [onChange] - 상태 변경 핸들러 (제어 컴포넌트용)
 * @returns {[TState, OnChange<TState>]} 상태값과 상태 변경 함수의 튜플
 * @throws {TypeError} value가 함수인 경우 에러 발생
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function useControlledState<TState, TOnChange extends Function = OnChange<TState>>(
  value: TState,
  onChange?: TOnChange
): [TState, OnChange<TState>] {
  if (typeof value === "function") {
    throw new TypeError(
      "Functions are not supported as state values in the `useControlledState` hook."
    );
  }

  const [uncontrolledValue, setUncontrolledValue] = useState<TState>(value);

  const handleChange = (setStateArgument: React.SetStateAction<TState>) => {
    if (onChange) {
      const newValue =
        typeof setStateArgument === "function"
          ? (setStateArgument as StateUpdater<TState>)(value)
          : setStateArgument;

      return onChange(newValue);
    }
  };

  if (typeof onChange === "function") {
    // Controlled version
    return [value, handleChange];
  }

  // Uncontrolled version
  return [uncontrolledValue, setUncontrolledValue];
}
