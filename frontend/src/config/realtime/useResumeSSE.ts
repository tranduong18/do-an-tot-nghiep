import { useEffect, useRef } from "react";
import { notification } from "antd";
import { connectResumeSSE, ResumeStatusEvent } from "@/config/realtime/sse";
import { emitNotiRefresh } from "@/config/realtime/eventBus";

const STATUS_VN: Record<string, string> = {
    PENDING: "Chờ duyệt",
    REVIEWING: "Đang xem xét",
    APPROVED: "Đã phê duyệt",
    REJECTED: "Từ chối",
};

type Options = {
    apiBaseUrl: string;
    userId?: number | string | null;
    onEvent?: (ev: ResumeStatusEvent) => void;
    autoReconnectMs?: number;
};

export const useResumeSSE = ({
    apiBaseUrl,
    userId,
    onEvent,
    autoReconnectMs = 3000,
}: Options) => {
    const esRef = useRef<EventSource | null>(null);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (!userId) return;

        const open = () => {
            esRef.current = connectResumeSSE(apiBaseUrl, (msg) => {
                notification.info({
                    message: "Cập nhật hồ sơ",
                    description: `Trạng thái hồ sơ "${msg.job ?? ""}" tại ${msg.company ?? ""}: ${msg.statusText || STATUS_VN[msg.status] || msg.status
                        }`,
                    placement: "bottomRight",
                });
                onEvent?.(msg);
                emitNotiRefresh(); // báo NotificationBell refetch badge/list
            });

            esRef.current!.onerror = () => {
                try { esRef.current?.close(); } catch { }
                if (timerRef.current) window.clearTimeout(timerRef.current);
                timerRef.current = window.setTimeout(open, autoReconnectMs) as unknown as number;
            };
        };

        open();

        return () => {
            if (timerRef.current) window.clearTimeout(timerRef.current);
            try { esRef.current?.close(); } catch { }
            esRef.current = null;
        };
    }, [apiBaseUrl, userId, onEvent, autoReconnectMs]);
};
