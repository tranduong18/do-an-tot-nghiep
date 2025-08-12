export type ResumeStatusEvent = {
    resumeId: number;
    status: "PENDING" | "REVIEWING" | "APPROVED" | "REJECTED";
    statusText?: string;
    job?: string;
    company?: string;
    createdAt?: string;
};

export function connectResumeSSE(
    baseUrl: string,
    onResumeStatus: (data: ResumeStatusEvent) => void
) {
    const url = `${baseUrl}/api/v1/resume-sse/subscribe`;
    const es = new EventSource(url, { withCredentials: true });

    es.addEventListener("resumeStatus", (e: MessageEvent) => {
        try {
            const data = JSON.parse(e.data);
            onResumeStatus(data);
        } catch {
            onResumeStatus(e.data as any);
        }
    });

    es.onerror = () => {
        try { es.close(); } catch { }
    };

    return es;
}
