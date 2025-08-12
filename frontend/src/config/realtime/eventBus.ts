export const NOTI_REFRESH_EVENT = "noti:refresh";

export const emitNotiRefresh = () => {
    window.dispatchEvent(new CustomEvent(NOTI_REFRESH_EVENT));
};

export const onNotiRefresh = (handler: () => void) => {
    const listener = () => handler();
    window.addEventListener(NOTI_REFRESH_EVENT, listener);
    return () => window.removeEventListener(NOTI_REFRESH_EVENT, listener);
};
