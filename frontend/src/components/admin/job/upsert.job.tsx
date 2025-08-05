import {
    Breadcrumb,
    Col,
    ConfigProvider,
    Divider,
    Form,
    Row,
    message,
    notification,
} from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DebounceSelect } from "../user/debouce.select";
import {
    FooterToolbar,
    ProForm,
    ProFormDatePicker,
    ProFormDigit,
    ProFormSelect,
    ProFormSwitch,
    ProFormText,
} from "@ant-design/pro-components";
import styles from "styles/admin.module.scss";
import { LOCATION_LIST } from "@/config/utils";
import { ICompanySelect } from "../user/modal.user";
import { useState, useEffect } from "react";
import {
    callCreateJob,
    callFetchAllSkill,
    callFetchCompany,
    callFetchJobById,
    callUpdateJob,
} from "@/config/api";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { CheckSquareOutlined } from "@ant-design/icons";
import enUS from "antd/lib/locale/en_US";
import dayjs from "dayjs";
import { IJob, ISkill } from "@/types/backend";

interface ISkillSelect {
    label: string;
    value: string;
    key?: string;
}

const ViewUpsertJob = () => {
    const [companies, setCompanies] = useState<ICompanySelect[]>([]);
    const [skills, setSkills] = useState<ISkillSelect[]>([]);

    const navigate = useNavigate();
    const [value, setValue] = useState<string>("");

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // job id
    const [dataUpdate, setDataUpdate] = useState<IJob | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        const init = async () => {
            const temp = await fetchSkillList();
            setSkills(temp);

            if (id) {
                const res = await callFetchJobById(id);
                if (res && res.data) {
                    setDataUpdate(res.data);
                    setValue(res.data.description);
                    setCompanies([
                        {
                            label: res.data.company?.name as string,
                            value: `${res.data.company?.id}@#$${res.data.company?.logo}` as string,
                            key: res.data.company?.id,
                        },
                    ]);

                    const tempSkills: any = res.data?.skills?.map((item: ISkill) => ({
                        label: item.name,
                        value: item.id,
                        key: item.id,
                    }));

                    form.setFieldsValue({
                        ...res.data,
                        company: {
                            label: res.data.company?.name as string,
                            value: `${res.data.company?.id}@#$${res.data.company?.logo}` as string,
                            key: res.data.company?.id,
                        },
                        skills: tempSkills,
                        specialization: res.data.specialization,
                        fields: res.data.fields,
                        address: res.data.address,
                        workType: res.data.workType,
                    });
                }
            }
        };
        init();
        return () => form.resetFields();
    }, [id]);

    async function fetchCompanyList(name: string): Promise<ICompanySelect[]> {
        const res = await callFetchCompany(`page=1&size=100&name ~ '${name}'`);
        if (res && res.data) {
            const list = res.data.result;
            return list.map((item) => ({
                label: item.name as string,
                value: `${item.id}@#$${item.logo}` as string,
            }));
        }
        return [];
    }

    async function fetchSkillList(): Promise<ISkillSelect[]> {
        const res = await callFetchAllSkill(`page=1&size=100`);
        if (res && res.data) {
            return res.data.result.map((item: any) => ({
                label: item.name as string,
                value: `${item.id}` as string,
            }));
        }
        return [];
    }

    const onFinish = async (values: any) => {
        const cp = values?.company?.value?.split("@#$");
        let arrSkills = [];

        if (typeof values?.skills?.[0] === "object") {
            arrSkills = values?.skills?.map((item: any) => ({ id: item.value }));
        } else {
            arrSkills = values?.skills?.map((item: any) => ({ id: +item }));
        }

        const job = {
            name: values.name,
            skills: arrSkills,
            company: {
                id: cp && cp.length > 0 ? cp[0] : "",
                name: values.company.label,
                logo: cp && cp.length > 1 ? cp[1] : "",
            },
            location: values.location,
            address: values.address,
            salary: values.salary,
            quantity: values.quantity,
            level: values.level,
            specialization: values.specialization,
            fields: values.fields,
            workType: values.workType,
            description: value,
            startDate: /[0-9]{2}[/][0-9]{2}[/][0-9]{4}$/.test(values.startDate)
                ? dayjs(values.startDate, "DD/MM/YYYY").toDate()
                : values.startDate,
            endDate: /[0-9]{2}[/][0-9]{2}[/][0-9]{4}$/.test(values.endDate)
                ? dayjs(values.endDate, "DD/MM/YYYY").toDate()
                : values.endDate,
            active: values.active,
        };

        const res = dataUpdate?.id
            ? await callUpdateJob(job, dataUpdate.id)
            : await callCreateJob(job);

        if (res.data) {
            message.success(
                dataUpdate?.id ? "Cập nhật job thành công" : "Tạo mới job thành công"
            );
            navigate("/admin/job");
        } else {
            notification.error({
                message: "Có lỗi xảy ra",
                description: res.message,
            });
        }
    };

    return (
        <div className={styles["upsert-job-container"]}>
            <div className={styles["title"]}>
                <Breadcrumb
                    separator=">"
                    items={[
                        { title: <Link to="/admin/job">Quản lý việc làm</Link> },
                        { title: "Tạo mới việc làm" },
                    ]}
                />
            </div>
            <ConfigProvider locale={enUS}>
                <ProForm
                    form={form}
                    onFinish={onFinish}
                    submitter={{
                        searchConfig: {
                            resetText: "Hủy",
                            submitText: (
                                <>{dataUpdate?.id ? "Cập nhật Job" : "Tạo mới Job"}</>
                            ),
                        },
                        onReset: () => navigate("/admin/job"),
                        render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
                        submitButtonProps: { icon: <CheckSquareOutlined /> },
                    }}
                >
                    <Row gutter={[20, 20]}>
                        <Col span={24} md={12}>
                            <ProFormText
                                label="Tên việc làm"
                                name="name"
                                rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
                                placeholder="Nhập tên job"
                            />
                        </Col>

                        <Col span={24} md={6}>
                            <ProFormSelect
                                name="skills"
                                label="Kỹ năng yêu cầu"
                                options={skills}
                                placeholder="Chọn kỹ năng"
                                rules={[{ required: true, message: "Vui lòng chọn kỹ năng!" }]}
                                allowClear
                                mode="multiple"
                                fieldProps={{ suffixIcon: null }}
                            />
                        </Col>

                        <Col span={24} md={6}>
                            <ProFormSelect
                                name="location"
                                label="Địa điểm"
                                options={LOCATION_LIST.filter((item) => item.value !== "ALL")}
                                placeholder="Chọn địa điểm"
                                rules={[{ required: true, message: "Vui lòng chọn địa điểm!" }]}
                            />
                        </Col>

                        <Col span={24} md={6}>
                            <ProFormDigit
                                label="Mức lương"
                                name="salary"
                                rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
                                placeholder="Nhập mức lương"
                                fieldProps={{
                                    addonAfter: " đ",
                                    formatter: (value) =>
                                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                                    parser: (value) =>
                                        +(value || "").replace(/\$\s?|(,*)/g, ""),
                                }}
                            />
                        </Col>

                        <Col span={24} md={6}>
                            <ProFormDigit
                                label="Số lượng"
                                name="quantity"
                                rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
                                placeholder="Nhập số lượng"
                            />
                        </Col>

                        <Col span={24} md={6}>
                            <ProFormSelect
                                name="level"
                                label="Trình độ"
                                valueEnum={{
                                    INTERN: "INTERN",
                                    FRESHER: "FRESHER",
                                    JUNIOR: "JUNIOR",
                                    MIDDLE: "MIDDLE",
                                    SENIOR: "SENIOR",
                                }}
                                placeholder="Chọn level"
                                rules={[{ required: true, message: "Vui lòng chọn level!" }]}
                            />
                        </Col>

                        <Col span={24} md={6}>
                            <ProFormText
                                name="specialization"
                                label="Chuyên môn"
                                placeholder="Nhập chuyên môn"
                                rules={[{ required: true, message: "Vui lòng nhập chuyên môn!" }]}
                            />
                        </Col>

                        <Col span={24} md={6}>
                            <ProFormText
                                name="fields"
                                label="Lĩnh vực"
                                placeholder="Nhập lĩnh vực (cách nhau bằng dấu phẩy)"
                                rules={[{ required: true, message: "Vui lòng nhập lĩnh vực!" }]}
                            />
                        </Col>

                        <Col span={24} md={12}>
                            <ProFormText
                                name="address"
                                label="Địa chỉ chi tiết"
                                placeholder="Nhập địa chỉ cụ thể"
                                rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
                            />
                        </Col>

                        <Col span={24} md={6}>
                            <ProFormSelect
                                name="workType"
                                label="Loại hình làm việc"
                                placeholder="Chọn loại hình làm việc"
                                options={[
                                    { label: "Toàn thời gian", value: "Full-time" },
                                    { label: "Bán thời gian", value: "Part-time" },
                                    { label: "Remote", value: "Remote" },
                                    { label: "Hybrid", value: "Hybrid" },
                                ]}
                                rules={[
                                    { required: true, message: "Vui lòng chọn loại hình làm việc!" },
                                ]}
                            />
                        </Col>

                        {(dataUpdate?.id || !id) && (
                            <Col span={24} md={6}>
                                <ProForm.Item
                                    name="company"
                                    label="Thuộc Công Ty"
                                    rules={[{ required: true, message: "Vui lòng chọn company!" }]}
                                >
                                    <DebounceSelect
                                        allowClear
                                        showSearch
                                        defaultValue={companies}
                                        value={companies}
                                        placeholder="Chọn công ty"
                                        fetchOptions={fetchCompanyList}
                                        onChange={(newValue: any) => {
                                            if (
                                                newValue?.length === 0 ||
                                                newValue?.length === 1
                                            ) {
                                                setCompanies(newValue as ICompanySelect[]);
                                            }
                                        }}
                                        style={{ width: "100%" }}
                                    />
                                </ProForm.Item>
                            </Col>
                        )}
                    </Row>

                    <Row gutter={[20, 20]}>
                        <Col span={24} md={6}>
                            <ProFormDatePicker
                                label="Ngày bắt đầu"
                                name="startDate"
                                normalize={(value) =>
                                    value && dayjs(value, "DD/MM/YYYY")
                                }
                                fieldProps={{ format: "DD/MM/YYYY" }}
                                rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
                                placeholder="dd/mm/yyyy"
                            />
                        </Col>

                        <Col span={24} md={6}>
                            <ProFormDatePicker
                                label="Ngày kết thúc"
                                name="endDate"
                                normalize={(value) =>
                                    value && dayjs(value, "DD/MM/YYYY")
                                }
                                fieldProps={{ format: "DD/MM/YYYY" }}
                                rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
                                placeholder="dd/mm/yyyy"
                            />
                        </Col>

                        <Col span={24} md={6}>
                            <ProFormSwitch
                                label="Trạng thái"
                                name="active"
                                checkedChildren="ACTIVE"
                                unCheckedChildren="INACTIVE"
                                initialValue={true}
                                fieldProps={{ defaultChecked: true }}
                            />
                        </Col>

                        <Col span={24}>
                            <ProForm.Item
                                name="description"
                                label="Miêu tả"
                                rules={[
                                    { required: true, message: "Vui lòng nhập miêu tả job!" },
                                ]}
                            >
                                <ReactQuill theme="snow" value={value} onChange={setValue} />
                            </ProForm.Item>
                        </Col>
                    </Row>

                    <Divider />
                </ProForm>
            </ConfigProvider>
        </div>
    );
};

export default ViewUpsertJob;
