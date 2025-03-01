import { Link, Outlet, useLocation } from "react-router";
import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider } from "~/common/components/ui/sidebar";
import { ListIcon, PlusIcon } from "lucide-react";

export default function InfluencerLayout() {
    const location = useLocation();

    return (
        <SidebarProvider className="min-h-full overflow-hidden">
            <Sidebar className="pt-16" variant="floating">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={location.pathname === "/campaigns/influencer"}>
                                    <Link to="/campaigns/influencer">
                                        <ListIcon className="size-4" />
                                        <span>캠페인 목록</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={location.pathname === "/campaigns/influencer/new"}>
                                    <Link to="/campaigns/influencer/new">
                                        <PlusIcon className="size-4" />
                                        <span>새 캠페인</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
            <div className="w-full pl-20">
                <Outlet />
            </div>
        </SidebarProvider>
    );
} 