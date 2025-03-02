/**
 * @description 사용자 로그인 페이지 컴포넌트
 * @route /auth/login
 */

import { data, Form, redirect } from "react-router";
import InputPair from "~/common/components/input-pair";
import { Button } from "~/common/components/ui/button";
import { getServerClient } from "~/server";
import AuthButtons from "../components/auth-buttons";
import AuthFormContainer from "../components/auth-form-container";
import type { Route } from "./+types/login-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { supabase, headers } = getServerClient(request)
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    return redirect("/", { headers });
  }

  return {};
};

export const action = async ({ request }: Route.ActionArgs) => {
  const { supabase, headers } = getServerClient(request);
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const errors: Record<string, string> = {};

  if (!email) {
    errors.email = "이메일을 입력해주세요.";
  } else if (!email.includes("@")) {
    errors.email = "올바른 이메일 형식이 아닙니다.";
  }

  if (!password) {
    errors.password = "비밀번호를 입력해주세요.";
  }

  if (Object.keys(errors).length > 0) {
    return data({ errors }, { status: 400 });
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return data(
        { errors: { form: "이메일 또는 비밀번호가 올바르지 않습니다." } },
        { status: 400 }
      );
    }

    return redirect("/", {
      headers
    });
  } catch (error) {
    return data(
      { errors: { form: "로그인 중 오류가 발생했습니다. 다시 시도해주세요." } },
      { status: 500 }
    );
  }
};

export const meta: Route.MetaFunction = () => {
  return [{ title: "로그인 | Inf" }, { name: "description", content: "Inf 서비스 로그인" }];
};

export default function LoginPage({ loaderData, actionData }: Route.ComponentProps) {
  const errors = actionData?.errors;

  return (
    <AuthFormContainer
      title="로그인"
      description="Inf 서비스를 이용하기 위해 로그인해주세요"
      redirectLabel="회원가입"
      redirectTo="/auth/join"
    >
      <Form method="post" className="w-full space-y-3 md:space-y-4">
        {errors?.form && (
          <div className="text-sm text-red-500 rounded-md bg-red-50 p-2">{errors.form}</div>
        )}
        {/* email */}
        <InputPair
          id="email"
          description="이메일을 입력해주세요"
          label="이메일"
          name="email"
          placeholder="이메일을 입력해주세요"
          required
        // error={errors?.email}
        />
        {/* password */}
        <InputPair
          id="password"
          description="비밀번호를 입력해주세요"
          label="비밀번호"
          name="password"
          placeholder="비밀번호를 입력해주세요"
          required
          type="password"
        // error={errors?.password}
        />

        <Button className="w-full py-5" type="submit">
          로그인
        </Button>
      </Form>
      <AuthButtons />
    </AuthFormContainer>
  );
}
