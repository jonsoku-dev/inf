import type { Notification } from "./types";
import { getServerClient } from "~/server";

export async function getNotifications(request: Request) {
    const { supabase } = getServerClient(request);
    const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

    return data || [];
}

export async function getNotificationById(request: Request, id: string) {
    const { supabase } = getServerClient(request);
    const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("notification_id", id)
        .single();

    return data;
}

function convertDatesToStrings(data: Partial<Notification>) {
    const result: any = { ...data };

    // 타입 체크 대신 직접 변환 시도
    try {
        if (data.publish_date) result.publish_date = new Date(data.publish_date).toISOString();
        if (data.expiry_date) result.expiry_date = new Date(data.expiry_date).toISOString();
        if (data.created_at) result.created_at = new Date(data.created_at).toISOString();
        if (data.updated_at) result.updated_at = new Date(data.updated_at).toISOString();
    } catch (e) {
        // 변환 실패 시 원래 값 유지
    }

    return result;
}

export async function createNotification(request: Request, data: Partial<Notification>) {
    const { supabase } = getServerClient(request);
    const { data: newNotification, error } = await supabase
        .from("notifications")
        .insert(convertDatesToStrings(data))
        .select()
        .single();

    if (error) throw new Error(error.message);
    return newNotification;
}

export async function updateNotification(request: Request, id: string, data: Partial<Notification>) {
    const { supabase } = getServerClient(request);
    const { data: updatedNotification, error } = await supabase
        .from("notifications")
        .update(convertDatesToStrings(data))
        .eq("notification_id", id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return updatedNotification;
}

export async function deleteNotification(request: Request, id: string) {
    const { supabase } = getServerClient(request);
    const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("notification_id", id);

    if (error) throw new Error(error.message);
}

export async function markNotificationAsRead(request: Request, notificationId: string, userId: string) {
    const { supabase } = getServerClient(request);
    const { error } = await supabase
        .from("notification_reads")
        .insert({
            notification_id: notificationId,
            user_id: userId,
            read_at: new Date().toISOString()
        });

    if (error) throw new Error(error.message);
} 