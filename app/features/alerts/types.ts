import { ALERT_TYPE, ALERT_STATUS } from "./constants";

export interface Alert {
    alert_id: string;
    recipient_id: string;
    sender_id?: string;
    alert_type: keyof typeof ALERT_TYPE;
    title: string;
    content: string;
    link?: string;
    metadata?: string;
    alert_status: keyof typeof ALERT_STATUS;
    is_important: boolean;
    created_at: string;
    read_at?: string;
}

export interface AlertSettings {
    setting_id: string;
    profile_id: string;
    email_notifications: boolean;
    push_notifications: boolean;
    line_notifications: boolean;
    campaign_alerts: boolean;
    application_alerts: boolean;
    proposal_alerts: boolean;
    system_alerts: boolean;
    created_at: string;
    updated_at: string;
} 