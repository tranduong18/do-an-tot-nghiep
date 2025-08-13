import { Badge, Button, Checkbox, Divider, Dropdown, Space } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

const OPTIONS = [
    { label: "Tại văn phòng", value: "ONSITE" },
    { label: "Làm từ xa", value: "REMOTE" },
    { label: "Linh hoạt", value: "HYBRID" },
] as const;

export type WorkType = (typeof OPTIONS)[number]["value"];

export default function WorkTypeFilter({
    value = [],
    onChange,
}: {
    value?: WorkType[];
    onChange?: (v: WorkType[]) => void;
}) {
    const [open, setOpen] = useState(false);
    const [temp, setTemp] = useState<WorkType[]>(value);

    useEffect(() => {
        if (open) setTemp(value);
    }, [open]);

    const overlay = (
        <div
            style={{
                width: 260,
                background: "#fff",
                borderRadius: 8,
                boxShadow:
                    "0 6px 20px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)",
                padding: 12,
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <Checkbox.Group
                style={{ display: "grid", gap: 10 }}
                value={temp}
                onChange={(vals) => setTemp(vals as WorkType[])}
                options={OPTIONS as any}
            />
            <Divider style={{ margin: "12px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Button type="text" onClick={() => setTemp([])}>
                    Xoá
                </Button>
                <div style={{ display: "flex", gap: 8 }}>
                    <Button onClick={() => setOpen(false)}>Đóng</Button>
                    <Button
                        type="primary"
                        onClick={() => {
                            onChange?.(temp);
                            setOpen(false);
                        }}
                    >
                        Áp dụng
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <Dropdown
            open={open}
            onOpenChange={setOpen}
            trigger={["click"]}
            dropdownRender={() => overlay}
            placement="bottomLeft"
        >
            <Badge count={value.length} offset={[6, -2]}>
                <Button
                    size="large"
                    style={{ borderRadius: 999 }}
                    icon={<DownOutlined />}
                >
                    Hình thức làm việc
                </Button>
            </Badge>
        </Dropdown>
    );
}
