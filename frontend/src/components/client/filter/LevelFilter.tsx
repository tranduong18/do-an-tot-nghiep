import { Badge, Button, Checkbox, Divider, Dropdown, Space } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

const OPTIONS = [
    { label: "Intern", value: "INTERN" },
    { label: "Fresher", value: "FRESHER" },
    { label: "Junior", value: "JUNIOR" },
    { label: "Middle", value: "MIDDLE" },
    { label: "Senior", value: "SENIOR" },
] as const;

export type LevelType = (typeof OPTIONS)[number]["value"];

interface Props {
    value?: LevelType[];
    onChange?: (v: LevelType[]) => void;
}

export default function LevelFilter({ value = [], onChange }: Props) {
    const [open, setOpen] = useState(false);
    const [temp, setTemp] = useState<LevelType[]>(value);

    useEffect(() => {
        if (open) setTemp(value);
    }, [open]); // khi mở dropdown, sync từ value vào temp

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
                onChange={(vals) => setTemp(vals as LevelType[])}
                options={OPTIONS as any}
            />
            <Divider style={{ margin: "12px 0" }} />
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Button type="text" onClick={() => setTemp([])}>
                    Xoá
                </Button>
                <Space>
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
                </Space>
            </Space>
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
                    Cấp bậc
                </Button>
            </Badge>
        </Dropdown>
    );
}
