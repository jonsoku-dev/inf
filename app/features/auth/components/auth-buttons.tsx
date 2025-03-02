import { Link } from "react-router";
import SocialIcon, { SOCIAL_ICON_NAMES } from "~/common/components/social-icon";
import { Button } from "~/common/components/ui/button";
import { Separator } from "~/common/components/ui/separator";

export default function AuthButtons() {
  return (
    <div className="flex w-full flex-col items-center gap-2 py-4">
      <div className="flex w-full items-center gap-2 py-2">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-xs font-light uppercase md:text-sm">또는</span>
        <Separator className="flex-1" />
      </div>

      <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-1">
        {Object.values(SOCIAL_ICON_NAMES).map((option) => {
          const { label, icon } = option;
          return (
            <Link
              to={label === "OTP" ? "/auth/otp/start" : `/auth/social/${icon}/start`}
              key={label}
              className="block"
            >
              <Button variant="outline" className="w-full justify-start px-3 py-2 md:py-5">
                <SocialIcon name={icon} className="size-4 mr-2" />
                <span className="text-xs font-medium md:text-sm">{label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
