import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

// Composer prompt: create all the files for the routes in the file

export default [
    index("common/pages/home-page.tsx"),
    ...prefix("auth", [
        layout("features/auth/layouts/auth-layout.tsx", [
            route("/login", "features/auth/pages/login-page.tsx"),
            route("/join", "features/auth/pages/join-page.tsx"),
            route("/logout", "features/auth/pages/logout-page.tsx"),
            ...prefix("/otp", [
                route("/start", "features/auth/pages/otp-start-page.tsx"),
                route("/complete", "features/auth/pages/otp-complete-page.tsx"),
            ]),
            ...prefix("/social/:provider", [
                route("/start", "features/auth/pages/social-start-page.tsx"),
                route("/complete", "features/auth/pages/social-complete-page.tsx"),
            ]),
        ]),
    ]),
    ...prefix("/my", [
        route("/profile", "features/users/pages/my-profile-page.tsx"),
        route("/settings", "features/users/pages/settings-page.tsx"),
        route("/notifications", "features/users/pages/notifications-page.tsx"),
        layout("features/users/layouts/dashboard-layout.tsx", [
            ...prefix("/dashboard", [
                index("features/users/pages/dashboard-page.tsx"),
                route("/ideas", "features/users/pages/dashboard-ideas-page.tsx"),
                route("/products/:productId", "features/users/pages/dashboard-product-page.tsx"),
            ]),
        ]),
        layout("features/users/layouts/messages-layout.tsx", [
            ...prefix("/messages", [
                index("features/users/pages/messages-page.tsx"),
                route("/:messageId", "features/users/pages/message-page.tsx"),
            ]),
        ]),
        layout("features/campaigns/layouts/campaign-management-layout.tsx", [
            ...prefix("/campaigns", [
                index("features/campaigns/pages/campaign-list-page.tsx"),
                route("/new", "features/campaigns/pages/campaign-new-page.tsx"),
                route("/:campaignId", "features/campaigns/pages/campaign-detail-page.tsx"),
                route("/:campaignId/edit", "features/campaigns/pages/campaign-edit-page.tsx"),
                route("/:campaignId/applications", "features/campaigns/pages/campaign-applications-page.tsx"),
            ]),
        ]),
        layout("features/applications/layouts/application-management-layout.tsx", [
            ...prefix("/applications", [
                index("features/applications/pages/application-list-page.tsx"),
                route("/:applicationId", "features/applications/pages/application-detail-page.tsx"),
            ]),
        ]),
    ]),
    layout("features/users/layouts/profile-layout.tsx", [
        ...prefix("/users/:username", [
            index("features/users/pages/profile-page.tsx"),
            route("/posts", "features/users/pages/profile-posts-page.tsx"),
        ]),
    ]),
    ...prefix("/campaigns", [
        index("features/campaigns/pages/public-campaign-list-page.tsx"),
        route("/:campaignId", "features/campaigns/pages/public-campaign-detail-page.tsx"),
    ]),
] satisfies RouteConfig;
