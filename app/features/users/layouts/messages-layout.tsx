import { Outlet } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarProvider,
} from "~/common/components/ui/sidebar";
import { MessageUserItem } from "../components/message-user-item";

export default function MessagesLayout() {
  return (
    <SidebarProvider className="min-h-full overflow-hidden">
      <Sidebar className="pt-16" variant="floating">
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {Array.from({ length: 20 }).map((_, index) => (
                <MessageUserItem
                  key={index}
                  avatarUrl="https://github.com/shadcn.png"
                  fallback="CN"
                  name="John Doe"
                  lastSeen="Last seen 12 hours ago"
                  id={index.toString()}
                  isOnline={index % 3 === 0}
                />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className="w-full">
        <Outlet />
      </div>
    </SidebarProvider>
  );
}
