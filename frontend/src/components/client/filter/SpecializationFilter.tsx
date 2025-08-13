import { Badge, Button, Checkbox, Divider, Dropdown, Input, Space } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";

export type Specialization = string;

export default function SpecializationFilter({
    value = [],
    onChange,
    options = [],
}: {
    value?: Specialization[];
    onChange?: (v: Specialization[]) => void;
    options?: readonly string[];
}) {
    const [open, setOpen] = useState(false);
    const [kw, setKw] = useState("");
    const [temp, setTemp] = useState<Specialization[]>(value);

    useEffect(() => {
        if (open) setTemp(value);
    }, [open, value]);

    const filtered = useMemo(
        () => options.filter((o) => o.toLowerCase().includes(kw.toLowerCase())),
        [options, kw]
    );

    const overlay = (
        <div
            style={{
                width: 280,
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 6px 20px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)",
                padding: 12,
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <Input
                placeholder="Tìm lĩnh vực..."
                style={{ marginBottom: 10 }}
                value={kw}
                onChange={(e) => setKw(e.target.value)}
                allowClear
            />
            <Checkbox.Group
                style={{ display: "grid", gap: 10, maxHeight: 260, overflow: "auto" }}
                value={temp}
                onChange={(vals) => setTemp(vals as Specialization[])}
                options={filtered.map((x) => ({ label: x, value: x }))}
            />
            <Divider style={{ margin: "12px 0" }} />
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Button type="text" onClick={() => setTemp([])}>Xoá</Button>
                <Space>
                    <Button onClick={() => setOpen(false)}>Đóng</Button>
                    <Button type="primary" onClick={() => { onChange?.(temp); setOpen(false); }}>
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
                <Button size="large" style={{ borderRadius: 999 }} icon={<DownOutlined />}>
                    Lĩnh vực công việc
                </Button>
            </Badge>
        </Dropdown>
    );
}
