/**
 * @description OTP 인증 폼 상태 관리를 위한 커스텀 훅
 */

import { useState } from "react";
import { useNavigate } from "react-router";

type ContactType = "email" | "phone";

interface UseOtpFormReturn {
  contactType: ContactType;
  isOtpSent: boolean;
  otpValue: string;
  setContactType: (type: ContactType) => void;
  setOtpValue: (value: string) => void;
  handleSendOtp: () => Promise<void>;
  handleVerifyOtp: () => Promise<void>;
}

export function useOtpForm(): UseOtpFormReturn {
  const navigate = useNavigate();
  const [contactType, setContactType] = useState<ContactType>("email");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");

  const handleSendOtp = async () => {
    // TODO: OTP 전송 로직 구현
    setIsOtpSent(true);
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) {
      return;
    }

    try {
      // TODO: OTP 검증 로직 구현
      console.log("Verifying OTP:", otpValue);

      // 검증 성공 시 완료 페이지로 이동
      navigate("/auth/otp/complete");
    } catch (error) {
      // TODO: 에러 처리
      console.error("OTP verification failed:", error);
    }
  };

  return {
    contactType,
    isOtpSent,
    otpValue,
    setContactType,
    setOtpValue,
    handleSendOtp,
    handleVerifyOtp,
  };
}
