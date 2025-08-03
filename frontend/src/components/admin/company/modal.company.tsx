import { CheckSquareOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import {
    FooterToolbar,
    ModalForm,
    ProCard,
    ProFormText,
    ProFormTextArea,
    ProFormSelect,
} from "@ant-design/pro-components";
import { Col, ConfigProvider, Form, Modal, Row, Upload, message, notification } from "antd";
import "styles/reset.scss";
import { isMobile } from "react-device-detect";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useEffect, useState } from "react";
import { callCreateCompany, callUpdateCompany, callUploadSingleFile } from "@/config/api";
import { ICompany } from "@/types/backend";
import { v4 as uuidv4 } from "uuid";
import enUS from "antd/lib/locale/en_US";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: ICompany | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

const ModalCompany = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;

    const [animation, setAnimation] = useState<string>("open");
    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
    const [dataLogo, setDataLogo] = useState<{ name: string; uid: string }[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [previewTitle, setPreviewTitle] = useState("");
    const [valueDesc, setValueDesc] = useState<string>("");
    const [valueBenefits, setValueBenefits] = useState<string>("");
    const [form] = Form.useForm();

    useEffect(() => {
        if (dataInit?.id) {
            setValueDesc(dataInit.description || "");
            setValueBenefits(dataInit.benefits || "");
            form.setFieldsValue({
                name: dataInit.name || "",
                address: dataInit.address || "",
                country: dataInit.country || "",
                website: dataInit.website || "",
                industry: dataInit.industry || "",
                size: dataInit.size || "",
                model: dataInit.model || "",
                workingTime: dataInit.workingTime || "",
                overtimePolicy: dataInit.overtimePolicy || "",
                tags: dataInit.tags ? dataInit.tags.split(",") : []
            });
            setDataLogo([
                {
                    name: dataInit.logo || "",
                    uid: uuidv4(),
                },
            ]);
        }
    }, [dataInit]);

    const submitCompany = async (valuesForm: any) => {
        const payload = {
            ...valuesForm,
            description: valueDesc,
            benefits: valueBenefits,
            logo: dataLogo[0]?.name,
        };

        if (Array.isArray(valuesForm.tags)) {
            payload.tags = valuesForm.tags.join(",");
        }

        if (dataLogo.length === 0) {
            message.error("Vui lòng upload ảnh Logo");
            return;
        }

        let res;
        if (dataInit?.id) {
            res = await callUpdateCompany(dataInit.id, { ...payload, logo: dataLogo[0].name });
        } else {
            res = await callCreateCompany({ ...payload, logo: dataLogo[0].name });
        }

        if (res?.data) {
            message.success(`${dataInit?.id ? "Cập nhật" : "Thêm mới"} company thành công`);
            handleReset();
            reloadTable();
        } else {
            notification.error({
                message: "Có lỗi xảy ra",
                description: res?.message,
            });
        }
    };

    const handleReset = async () => {
        form.resetFields();
        setValueDesc("");
        setValueBenefits("");
        setDataInit(null);
        setAnimation("close");
        await new Promise((r) => setTimeout(r, 400));
        setOpenModal(false);
        setAnimation("open");
    };

    const handleRemoveFile = () => setDataLogo([]);

    const handlePreview = async (file: any) => {
        if (!file.originFileObj) {
            setPreviewImage(file.url);
            setPreviewOpen(true);
            setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf("/") + 1));
            return;
        }
        getBase64(file.originFileObj, (url: string) => {
            setPreviewImage(url);
            setPreviewOpen(true);
            setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf("/") + 1));
        });
    };

    const getBase64 = (img: any, callback: any) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => callback(reader.result));
        reader.readAsDataURL(img);
    };

    const beforeUpload = (file: any) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        const isAllowedType = allowedTypes.includes(file.type);

        if (!isAllowedType) {
            message.error("Bạn chỉ có thể upload JPG/PNG/WEBP!");
        }

        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error("Ảnh phải nhỏ hơn 2MB!");
        }

        return isAllowedType && isLt2M;
    };


    const handleChange = (info: any) => {
        if (info.file.status === "uploading") setLoadingUpload(true);
        if (info.file.status === "done" || info.file.status === "error") setLoadingUpload(false);
    };

    const handleUploadFileLogo = async ({ file, onSuccess, onError }: any) => {
        const res = await callUploadSingleFile(file, "company", "image");
        if (res && res.data) {
            setDataLogo([{ name: res.data.fileName, uid: uuidv4() }]);
            if (onSuccess) onSuccess("ok");
        } else {
            setDataLogo([]);
            if (onError) onError({ event: new Error(res.message) });
        }
    };

    return (
        <>
            {openModal && (
                <>
                    <ModalForm
                        title={<>{dataInit?.id ? "Cập nhật Company" : "Tạo mới Company"}</>}
                        open={openModal}
                        modalProps={{
                            onCancel: () => handleReset(),
                            afterClose: () => handleReset(),
                            destroyOnClose: true,
                            width: isMobile ? "100%" : 900,
                            footer: null,
                            keyboard: false,
                            maskClosable: false,
                            className: `modal-company ${animation}`,
                            rootClassName: `modal-company-root ${animation}`,
                        }}
                        scrollToFirstError
                        preserve={false}
                        form={form}
                        onFinish={submitCompany}
                        initialValues={dataInit?.id ? dataInit : {}}
                        submitter={{
                            submitButtonProps: { icon: <CheckSquareOutlined /> },
                            searchConfig: {
                                resetText: "Hủy",
                                submitText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
                            },
                        }}
                    >
                        <Row gutter={16}>
                            <Col span={24}>
                                <ProFormText
                                    label="Tên công ty"
                                    name="name"
                                    rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
                                    placeholder="Nhập tên công ty"
                                />
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    labelCol={{ span: 24 }}
                                    label="Ảnh Logo"
                                    name="logo"
                                    rules={[
                                        {
                                            required: true,
                                            validator: () => (dataLogo.length > 0 ? Promise.resolve() : Promise.reject(false)),
                                            message: "Vui lòng upload Logo",
                                        },
                                    ]}
                                >
                                    <ConfigProvider locale={enUS}>
                                        <Upload
                                            name="logo"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            maxCount={1}
                                            multiple={false}
                                            customRequest={handleUploadFileLogo}
                                            beforeUpload={beforeUpload}
                                            onChange={handleChange}
                                            onRemove={handleRemoveFile}
                                            onPreview={handlePreview}
                                            defaultFileList={
                                                dataInit?.id
                                                    ? [
                                                        {
                                                            uid: uuidv4(),
                                                            name: dataInit?.logo ?? "",
                                                            status: "done",
                                                            url: dataInit?.logo,
                                                        },
                                                    ]
                                                    : []
                                            }
                                        >
                                            <div>
                                                {loadingUpload ? <LoadingOutlined /> : <PlusOutlined />}
                                                <div style={{ marginTop: 8 }}>Upload</div>
                                            </div>
                                        </Upload>
                                    </ConfigProvider>
                                </Form.Item>
                            </Col>

                            <Col span={16}>
                                <ProFormTextArea
                                    label="Địa chỉ"
                                    name="address"
                                    rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
                                    placeholder="Nhập địa chỉ công ty"
                                    fieldProps={{ autoSize: { minRows: 4 } }}
                                />
                            </Col>

                            {/* Các trường mới */}
                            <Col span={12}><ProFormText label="Quốc gia" name="country" placeholder="Nhập quốc gia" /></Col>
                            <Col span={12}><ProFormText label="Website" name="website" placeholder="Nhập website công ty" /></Col>
                            <Col span={12}><ProFormText label="Ngành nghề" name="industry" placeholder="Nhập lĩnh vực" /></Col>
                            <Col span={12}><ProFormText label="Quy mô nhân sự" name="size" placeholder="VD: 301-500 nhân viên" /></Col>
                            <Col span={12}><ProFormText label="Mô hình công ty" name="model" placeholder="VD: Product / Outsourcing" /></Col>
                            <Col span={12}><ProFormText label="Thời gian làm việc" name="workingTime" placeholder="VD: Thứ 2 - Thứ 6" /></Col>
                            <Col span={12}><ProFormText label="Chính sách OT" name="overtimePolicy" placeholder="VD: Không OT / Có OT" /></Col>

                            {/* Mô tả */}
                            <ProCard title="Miêu tả" headStyle={{ color: "#d81921" }} style={{ marginBottom: 20 }} headerBordered size="small" bordered>
                                <Col span={24}>
                                    <ReactQuill theme="snow" value={valueDesc} onChange={setValueDesc} />
                                </Col>
                            </ProCard>

                            {/* Phúc lợi */}
                            <ProCard title="Phúc lợi" headStyle={{ color: "#d81921" }} style={{ marginBottom: 20 }} headerBordered size="small" bordered>
                                <Col span={24}>
                                    <ReactQuill theme="snow" value={valueBenefits} onChange={setValueBenefits} />
                                </Col>
                            </ProCard>

                            {/* Tags */}
                            <Col span={24}>
                                <ProFormSelect
                                    label="Tags"
                                    name="tags"
                                    mode="tags"
                                    placeholder="Nhập tags và nhấn Enter (VD: Java, AWS, Agile)"
                                    options={[]}
                                />
                            </Col>
                        </Row>
                    </ModalForm>

                    <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={() => setPreviewOpen(false)} style={{ zIndex: 1500 }}>
                        <img alt="example" style={{ width: "100%" }} src={previewImage} />
                    </Modal>
                </>
            )}
        </>
    );
};

export default ModalCompany;
