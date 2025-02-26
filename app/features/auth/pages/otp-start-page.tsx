/**
 * @description OTP 인증 시작 페이지 컴포넌트
 * @route /auth/otp/start
 */

import * as React from "react";
import { Form } from "react-router";
import type { Route } from "./+types/otp-start-page";
import AuthFormContainer from "../components/auth-form-container";
import InputPair from "~/common/components/input-pair";
import { Button } from "~/common/components/ui/button";
import { useOtpForm } from "../hooks/use-otp-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/common/components/ui/select";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "~/common/components/ui/input-otp";
import { Label } from "~/common/components/ui/label";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

export const loader = ({ request }: Route.LoaderArgs) => {
  return {};
};

export const action = async ({ request }: Route.ActionArgs) => {
  return {};
};

export const meta: Route.MetaFunction = () => {
  return [
    { title: "OTP 인증 | Inf" },
    { name: "description", content: "Inf 서비스 OTP 인증" },
  ];
};

export default function OtpStartPage({ loaderData, actionData }: Route.ComponentProps) {
  const {
    contactType,
    isOtpSent,
    otpValue,
    setContactType,
    setOtpValue,
    handleSendOtp,
    handleVerifyOtp,
  } = useOtpForm();

  const handleSubmit = async (e: React.FormEvent) => {
    console.log({ e });
    e.preventDefault();
    if (isOtpSent) {
      await handleVerifyOtp();
    } else {
      await handleSendOtp();
    }
  };

  return (
    <AuthFormContainer
      title="OTP 인증"
      description="안전한 로그인을 위해 OTP 인증을 진행해주세요"
      redirectLabel="로그인으로 돌아가기"
      redirectTo="/auth/login"
    >
      <Form className="w-full space-y-6" onSubmit={handleSubmit}>
        {!isOtpSent ? (
          <>
            <div className="space-y-2">
              <Select
                value={contactType}
                onValueChange={(value) => setContactType(value as "email" | "phone")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="인증 방식 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">이메일</SelectItem>
                  <SelectItem value="phone">휴대폰 번호</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <InputPair
              id={contactType}
              description={`${contactType === "email" ? "이메일" : "휴대폰 번호"}를 입력해주세요`}
              label={contactType === "email" ? "이메일" : "휴대폰 번호"}
              name={contactType}
              placeholder={`${contactType === "email" ? "이메일" : "휴대폰 번호 (-없이 숫자만)"
                }를 입력해주세요`}
              required
              type={contactType === "email" ? "email" : "tel"}
            />

            <Button className="w-full" type="submit">
              인증번호 전송
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>인증번호</Label>
                <InputOTP
                  value={otpValue}
                  onChange={setOtpValue}
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                >
                  <InputOTPGroup className="justify-center gap-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <React.Fragment key={index}>
                        <InputOTPSlot index={index} className="rounded-md border" />
                        {index === 2 && <InputOTPSeparator />}
                      </React.Fragment>
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <p className="text-muted-foreground text-sm">
                  전송된 인증번호 6자리를 입력해주세요
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button className="w-full" type="submit">
                  인증하기
                </Button>
                <Button className="w-full" variant="outline" type="button" onClick={handleSendOtp}>
                  인증번호 재전송
                </Button>
              </div>
            </div>
          </>
        )}
      </Form>
    </AuthFormContainer>
  );
}
