import { Badge, Button, Divider, Dropdown, Slider, Space } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";

export type SalaryRange = [number, number];

export default function SalaryFilter({
    value = [0, 100_000_000],
    onChange,
    step = 1_000_000,
    min = 0,
    max = 100_000_000,
}: {
    value?: SalaryRange;
    onChange?: (v: SalaryRange) => void;
    step?: number;
    min?: number;
    max?: number;
}) {
    const [open, setOpen] = useState(false);
    const [temp, setTemp] = useState<SalaryRange>(value);

    useEffect(() => {
        if (open) setTemp(value);
    }, [open]);

    const label = useMemo(
        () => `${temp[0].toLocaleString()}đ - ${temp[1].toLocaleString()}đ`,
        [temp]
    );

    const overlay = (
        <div
            style={{
                width: 320,
                background: "#fff",
                borderRadius: 8,
                boxShadow:
                    "0 6px 20px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)",
                padding: 12,
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div style={{ marginBottom: 8, fontWeight: 500 }}>{label}</div>
            <Slider
                range
                min={min}
                max={max}
                step={step}
                value={temp}
                onChange={(v) => setTemp(v as SalaryRange)}
            />
            <Divider style={{ margin: "12px 0" }} />
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Button type="text" onClick={() => setTemp([min, max])}>
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

    const badgeCount = !(value[0] === min && value[1] === max) ? 1 : 0;

    return (
        <Dropdown
            open={open}
            onOpenChange={setOpen}
            trigger={["click"]}
            dropdownRender={() => overlay}
            placement="bottomLeft"
        >
            <Badge count={badgeCount} offset={[6, -2]}>
                <Button
                    size="large"
                    style={{ borderRadius: 999 }}
                    icon={<DownOutlined />}
                >
                    Mức lương
                </Button>
            </Badge>
        </Dropdown>
    );
}
