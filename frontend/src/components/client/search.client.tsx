import { Button, Col, Form, AutoComplete, Row, Select, notification, Input } from "antd";
import { EnvironmentOutlined, MonitorOutlined, SearchOutlined } from "@ant-design/icons";
import { LOCATION_LIST } from "@/config/utils";
import { ProForm } from "@ant-design/pro-components";
import { useEffect, useState } from "react";
import { callFetchAllSkill, callFetchSuggestions } from "@/config/api";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import debounce from "lodash/debounce";
import { convertSlug } from "@/config/utils";

interface ISuggestion {
    id: number;
    type: "job" | "company";
    value: string;
    name: string;
}

const SearchClient = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const optionsLocations = LOCATION_LIST;
    const [form] = Form.useForm();
    const [optionsSkills, setOptionsSkills] = useState<{ label: string; value: string }[]>([]);
    const [suggestions, setSuggestions] = useState<ISuggestion[]>([]);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (location.search) {
            const queryLocation = searchParams.get("location");
            const querySkills = searchParams.get("skills");
            const queryKeyword = searchParams.get("q");

            if (queryLocation) form.setFieldValue("location", queryLocation.split(","));
            if (querySkills) form.setFieldValue("skills", querySkills.split(","));
            if (queryKeyword) form.setFieldValue("keyword", queryKeyword);
        }
    }, [location.search]);

    useEffect(() => {
        fetchSkill();
    }, []);

    const fetchSkill = async () => {
        const res = await callFetchAllSkill(`page=1&size=100&sort=createdAt,desc`);
        if (res?.data) {
            const arr = res.data.result?.map((item) => ({
                label: item.name as string,
                value: item.id + "",   // gửi ID
            })) ?? [];
            setOptionsSkills(arr);
        }
    };

    const fetchSuggestions = debounce(async (q: string) => {
        if (!q) {
            setSuggestions([]);
            return;
        }
        try {
            const res = await callFetchSuggestions(q);
            setSuggestions(res.data);
        } catch (err) {
            console.error(err);
        }
    }, 300);

    const onFinish = async (values: any) => {
        const params = new URLSearchParams();

        if (values.keyword) params.set("q", values.keyword);
        if (values.skills?.length) params.set("skills", values.skills.join(","));
        if (values.location?.length) params.set("location", values.location.join(","));

        if (!params.toString()) {
            notification.error({
                message: "Có lỗi xảy ra",
                description: "Vui lòng nhập hoặc chọn tiêu chí tìm kiếm",
            });
            return;
        }

        navigate(`/job?${params.toString()}`);
    };

    return (
        <ProForm form={form} onFinish={onFinish} submitter={{ render: () => <></> }}>
            <Row gutter={[10, 10]} justify="center">
                {/* Ô keyword có autocomplete */}
                <Col xs={24} md={8}>
                    <ProForm.Item name="keyword">
                        <AutoComplete
                            style={{ width: "100%" }}
                            options={suggestions.map((item) => ({
                                value: item.value,
                                label: (
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span>{item.value}</span>
                                        <span style={{ fontSize: 12, color: "#999" }}>
                                            {item.type === "job" ? "Job" : "Company"}
                                        </span>
                                    </div>
                                ),
                                type: item.type,
                                id: item.id,
                                name: item.value // backend đã trả về name = value
                            }))}
                            onSearch={(val) => fetchSuggestions(val)}
                            onSelect={(value, option) => {
                                const slug = convertSlug(option.name || option.value);
                                if (option.type === "job") {
                                    navigate(`/job/${slug}?id=${option.id}`);
                                } else if (option.type === "company") {
                                    navigate(`/company/${slug}?id=${option.id}`);
                                }
                            }}
                        >
                            <Input
                                size="large"
                                placeholder="Nhập từ khóa (job, công ty...)"
                                prefix={<SearchOutlined />}
                            />
                        </AutoComplete>

                    </ProForm.Item>
                </Col>

                {/* Ô dropdown skill */}
                <Col xs={24} md={8}>
                    <ProForm.Item name="skills">
                        <Select
                            mode="multiple"
                            allowClear
                            size="large"
                            style={{ width: "100%" }}
                            placeholder={
                                <>
                                    <MonitorOutlined /> Kỹ năng...
                                </>
                            }
                            optionLabelProp="label"
                            options={optionsSkills}
                        />
                    </ProForm.Item>
                </Col>

                {/* Ô dropdown location */}
                <Col xs={12} md={5}>
                    <ProForm.Item name="location">
                        <Select
                            mode="multiple"
                            allowClear
                            size="large"
                            style={{ width: "100%" }}
                            placeholder={
                                <>
                                    <EnvironmentOutlined /> Địa điểm...
                                </>
                            }
                            optionLabelProp="label"
                            options={optionsLocations}
                        />
                    </ProForm.Item>
                </Col>

                {/* Nút tìm kiếm */}
                <Col xs={12} md={3}>
                    <Button type="primary" size="large" block onClick={() => form.submit()}>
                        Tìm kiếm
                    </Button>
                </Col>
            </Row>
        </ProForm>
    );
};

export default SearchClient;
