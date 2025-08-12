import { Badge, Button, Drawer, Empty, List, Popconfirm, Space, Tag, message } from "antd";
import { BellOutlined, DeleteOutlined, CheckOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
    callUnreadCount,
    callNotifications,
    callMarkRead,
    callReadAll,
    callDeleteNotification,
    callDeleteAllNotifications,
} from "@/config/api";
import { onNotiRefresh } from "@/config/realtime/eventBus";

type NotiItem = {
    id: number;
    title: string;
    content: string;
    type: string;
    read: boolean;
    createdAt: string;
};

export default function NotificationBell() {
    const [count, setCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<NotiItem[]>([]);
    const [page, setPage] = useState(1);
    const [size] = useState(10);
    const [total, setTotal] = useState(0);

    const fetchCount = async () => {
        try {
            const res = await callUnreadCount();
            setCount(res?.data?.count ?? 0);
        } catch { }
    };

    const fetchList = async (p = page) => {
        setLoading(true);
        try {
            const res = await callNotifications(p, size);
            if (res?.data) {
                setData(res.data.result || []);
                setTotal(res.data.meta?.total || 0);
            }
        } catch {
            message.error("Không tải được thông báo");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCount();
        const off = onNotiRefresh(() => {
            fetchCount();
            if (open) fetchList(1);
        });
        return () => off();
    }, [open]);

    useEffect(() => {
        if (open) {
            setPage(1);
            fetchList(1);
        }
    }, [open]);

    const handleMarkRead = async (id: number) => {
        await callMarkRead(id);
        fetchCount();
        fetchList(page);
    };

    const handleReadAll = async () => {
        await callReadAll();
        fetchCount();
        fetchList(1);
    };

    const handleDeleteOne = async (id: number) => {
        await callDeleteNotification(id);
        message.success("Đã xoá thông báo");
        const nextPage = (data.length === 1 && page > 1) ? page - 1 : page;
        setPage(nextPage);
        fetchList(nextPage);
        fetchCount();
    };

    const handleDeleteAll = async () => {
        await callDeleteAllNotifications();
        message.success("Đã xoá tất cả thông báo");
        setPage(1);
        fetchList(1);
        fetchCount();
    };

    const headerActions = useMemo(() => (
        <Space>
            <Popconfirm title="Đánh dấu đã đọc tất cả?" onConfirm={handleReadAll} okText="Xác nhận" cancelText="Hủy">
                <Button size="small" icon={<CheckOutlined />}>Đọc hết</Button>
            </Popconfirm>
            <Popconfirm title="Xoá tất cả thông báo?" onConfirm={handleDeleteAll} okText="Xoá" cancelText="Hủy">
                <Button danger size="small" icon={<DeleteOutlined />}>Xoá hết</Button>
            </Popconfirm>
        </Space>
    ), [data, page]);

    return (
        <>
            <Badge count={count} size="small" offset={[-2, 2]}>
                <Button
                    type="text"
                    icon={<BellOutlined style={{ fontSize: 18 }} />}
                    onClick={() => setOpen(true)}
                />
            </Badge>

            <Drawer
                title={<Space>Thông báo {headerActions}</Space>}
                open={open}
                onClose={() => setOpen(false)}
                width={480}
                destroyOnClose
            >
                <List
                    itemLayout="vertical"
                    dataSource={data}
                    loading={loading}
                    locale={{ emptyText: <Empty description="Chưa có thông báo" /> }}
                    pagination={{
                        current: page,
                        pageSize: size,
                        total,
                        onChange: (p) => { setPage(p); fetchList(p); },
                        showSizeChanger: false,
                    }}
                    renderItem={(item) => (
                        <List.Item
                            key={item.id}
                            actions={[
                                !item.read && (
                                    <Button size="small" onClick={() => handleMarkRead(item.id)} icon={<CheckOutlined />}>
                                        Đánh dấu đã đọc
                                    </Button>
                                ),
                                <Popconfirm
                                    title="Xoá thông báo này?"
                                    onConfirm={() => handleDeleteOne(item.id)}
                                    okText="Xoá"
                                    cancelText="Hủy"
                                >
                                    <Button size="small" danger icon={<DeleteOutlined />}>Xoá</Button>
                                </Popconfirm>
                            ].filter(Boolean) as any}
                        >
                            <List.Item.Meta
                                title={
                                    <Space>
                                        <span style={{ fontWeight: 600 }}>{item.title}</span>
                                        {!item.read && <Tag color="blue">Mới</Tag>}
                                        <Tag>{item.type || "RESUME_STATUS"}</Tag>
                                    </Space>
                                }
                                description={dayjs(item.createdAt).format("DD-MM-YYYY HH:mm")}
                            />
                            <div style={{ whiteSpace: "pre-line" }}>{item.content}</div>
                        </List.Item>
                    )}
                />
            </Drawer>
        </>
    );
}
