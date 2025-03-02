/**
 * @description 회원가입 페이지 컴포넌트
 * @route /auth/join
 */

import { data, Form, redirect } from "react-router";
import InputPair from "~/common/components/input-pair";
import { Button } from "~/common/components/ui/button";
import { getServerClient } from "~/server";
import AuthFormContainer from "../components/auth-form-container";
import type { Route } from "./+types/join-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { supabase, headers } = getServerClient(request)
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return redirect("/", { headers });
  }

  return {};
};

export const action = async ({ request }: Route.ActionArgs) => {
  const { supabase, headers } = getServerClient(request)
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;

  const errors: Record<string, string> = {};

  if (!email) {
    errors.email = "이메일을 입력해주세요.";
  } else if (!email.includes("@")) {
    errors.email = "올바른 이메일 형식이 아닙니다.";
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          username,
        },
      },
    });

    console.log(authData, authError);
    return redirect("/", { headers });
  } catch (error) {
    return data(
      { errors: { form: "회원가입 중 오류가 발생했습니다. 다시 시도해주세요." } },
      { status: 500 }
    );
  }
};

export const meta: Route.MetaFunction = () => {
  return [
    { title: "회원가입 | Inf" },
    { name: "description", content: "Inf 서비스 회원가입" },
  ];
};

export default function JoinPage({ loaderData, actionData }: Route.ComponentProps) {
  const errors = actionData?.errors;

  return (
    <AuthFormContainer
      title="회원가입"
      description="Inf 서비스에 오신 것을 환영합니다"
      redirectLabel="로그인"
      redirectTo="/auth/login"
    >
      <Form method="post" className="w-full space-y-3 md:space-y-4">
        {errors?.form && (
          <div className="text-sm text-red-500 rounded-md bg-red-50 p-2">{errors.form}</div>
        )}
        {/* name */}
        <InputPair
          id="name"
          description="이름을 입력해주세요"
          label="이름"
          name="name"
          placeholder="이름을 입력해주세요"
          required
        // error={errors?.name}
        />
        {/* username */}
        <InputPair
          id="username"
          description="사용자 이름을 입력해주세요"
          label="사용자 이름"
          name="username"
          placeholder="사용자 이름을 입력해주세요"
          required
        // error={errors?.username}
        />
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
          회원가입
        </Button>
      </Form>
    </AuthFormContainer>
  );
}
