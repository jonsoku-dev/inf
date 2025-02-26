import { Link } from "react-router";
import SocialIcon, { SOCIAL_ICON_NAMES } from "~/common/components/social-icon";
import { Button } from "~/common/components/ui/button";
import { Separator } from "~/common/components/ui/separator";

export default function AuthButtons() {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <Separator className="w-full" />
      <span className="text-muted-foreground text-sm font-light uppercase">Or continue with</span>
      <Separator className="w-full" />
      {Object.values(SOCIAL_ICON_NAMES).map((option) => {
        const { label, icon } = option;
        return (
          <Link
            to={label === "OTP" ? "/auth/otp/start" : `/auth/social/${icon}/start`}
            key={label}
            className="block w-full"
          >
            <Button variant="outline" className="w-full">
              <SocialIcon name={icon} className="size-4" />
              <span className="text-sm font-medium">{label}</span>
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
