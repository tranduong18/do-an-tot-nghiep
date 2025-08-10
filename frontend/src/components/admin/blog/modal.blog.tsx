// src/components/admin/blog/modal.blog.tsx
import { CheckSquareOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import {
    ModalForm,
    ProCard,
    ProFormText,
    ProFormTextArea,
    ProFormSelect,
    ProFormRadio,
} from "@ant-design/pro-components";
import { Col, ConfigProvider, Form, Modal, Row, Upload, message, notification } from "antd";
import "styles/reset.scss";
import { isMobile } from "react-device-detect";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useEffect, useMemo, useState } from "react";
import {
    callBlogCreate,
    callBlogUpdate,
    callUploadSingleFile,
    callFetchCompany,
} from "@/config/api";
import { IBlog, ICompany } from "@/types/backend";
import { v4 as uuidv4 } from "uuid";
import enUS from "antd/lib/locale/en_US";
import { useAppSelector } from "@/redux/hooks";
import { sfLike } from "spring-filter-query-builder";
import debounce from "lodash/debounce";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IBlog | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

const ModalBlog = ({ openModal, setOpenModal, reloadTable, dataInit, setDataInit }: IProps) => {
    const [animation, setAnimation] = useState<string>("open");
    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
    const [thumb, setThumb] = useState<{ name: string; uid: string }[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [previewTitle, setPreviewTitle] = useState("");
    const [content, setContent] = useState<string>("");
    const [form] = Form.useForm();

    // user/role
    const user = useAppSelector((s) => s.account.user);
    const isHR = user?.role?.name === "HR";
    const myCompanyId = user?.company?.id ? Number(user.company.id) : undefined;
    const myCompanyName = user?.company?.name ?? "";

    // company options
    const [companyOpts, setCompanyOpts] = useState<Array<{ label: string; value: number }>>([]);
    const [loadingCompany, setLoadingCompany] = useState(false);

    // ===== utils =====
    const getBase64 = (img: File, cb: (url: string) => void) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => cb(reader.result as string));
        reader.readAsDataURL(img);
    };

    const fetchCompanies = async (keyword?: string): Promise<void> => {
        try {
            setLoadingCompany(true);
            const q: any = { page: 1, size: 30, sort: "name,asc" };
            if (keyword?.trim()) q.filter = sfLike("name", keyword.trim());
            const query = new URLSearchParams(q).toString();
            const res = await callFetchCompany(query);
            const items: ICompany[] = Array.isArray(res?.data?.result) ? res.data.result : [];
            setCompanyOpts(
                items.map((c) => ({
                    label: String(c?.name ?? ""),
                    value: Number((c as any)?.id ?? 0),
                }))
            );
        } catch (e: any) {
            notification.error({ message: "Tải danh sách công ty thất bại", description: e?.message });
        } finally {
            setLoadingCompany(false);
        }
    };

    const handleSearchCompany = useMemo(
        () =>
            debounce((v: string) => {
                if (!isHR) void fetchCompanies(v);
            }, 400),
        [isHR]
    );

    useEffect(() => {
        return () => {
            // @ts-ignore
            handleSearchCompany?.cancel?.();
        };
    }, [handleSearchCompany]);

    // when open
    useEffect(() => {
        if (!openModal) return;

        if (isHR) {
            if (myCompanyId) {
                setCompanyOpts([{ label: String(myCompanyName), value: Number(myCompanyId) }]);
                form.setFieldsValue({ companyId: Number(myCompanyId) });
            } else {
                setCompanyOpts([]);
                form.setFieldsValue({ companyId: undefined });
            }
        } else {
            void fetchCompanies();
            if (!dataInit?.id) form.setFieldsValue({ companyId: 0 });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openModal, isHR, myCompanyId, myCompanyName]);

    // fill when editing / creating
    useEffect(() => {
        if (dataInit?.id) {
            setContent(dataInit.content || "");
            form.setFieldsValue({
                title: dataInit.title || "",
                description: dataInit.description || "",
                companyId:
                    isHR && myCompanyId !== undefined ? Number(myCompanyId) : Number(dataInit?.company?.id ?? 0),
                published: dataInit.published ? 1 : 0,
            });
            setThumb([{ name: dataInit.thumbnail || "", uid: uuidv4() }]);
        } else {
            setContent("");
            setThumb([]);
            form.setFieldsValue({
                published: 0,
                companyId: isHR && myCompanyId !== undefined ? Number(myCompanyId) : 0,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataInit]);

    // ===== submit =====
    const submit = async (values: any) => {
        if (!content) return message.error("Vui lòng nhập nội dung");
        if (thumb.length === 0) return message.error("Vui lòng upload thumbnail");

        // HR chỉ được draft: giữ nguyên trạng thái hiện có khi edit, còn tạo mới = false
        const published = isHR ? Boolean(dataInit?.published ?? false) : values.published === 1;

        const payload = {
            title: values.title,
            description: values.description,
            thumbnail: thumb[0].name,
            content,
            published,
            companyId: Number(values.companyId || 0), // 0 = System
        };

        try {
            let res;
            if (dataInit?.id) res = await callBlogUpdate({ id: dataInit.id, ...payload });
            else res = await callBlogCreate(payload);

            if (res?.data) {
                message.success(`${dataInit?.id ? "Cập nhật" : "Thêm mới"} blog thành công`);
                handleReset();
                reloadTable();
            } else {
                notification.error({ message: "Có lỗi xảy ra", description: res?.message });
            }
        } catch (e: any) {
            notification.error({ message: "Không thể lưu blog", description: e?.message });
        }
    };

    // ===== helpers =====
    const handleReset = async () => {
        form.resetFields();
        setContent("");
        setDataInit(null);
        setThumb([]);
        setAnimation("close");
        await new Promise((r) => setTimeout(r, 400));
        setOpenModal(false);
        setAnimation("open");
    };

    const handleRemoveFile = () => setThumb([]);

    const handlePreview = async (file: any) => {
        if (!file.originFileObj) {
            setPreviewImage(file.url);
            setPreviewOpen(true);
            setPreviewTitle(file.name || file.url?.substring(file.url.lastIndexOf("/") + 1));
            return;
        }
        getBase64(file.originFileObj, (url: string) => {
            setPreviewImage(url);
            setPreviewOpen(true);
            setPreviewTitle(file.name || file.url?.substring(file.url.lastIndexOf("/") + 1));
        });
    };

    const beforeUpload = (file: any) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        const okType = allowed.includes(file.type);
        if (!okType) message.error("Bạn chỉ có thể upload JPG/PNG/WEBP!");
        const okSize = file.size / 1024 / 1024 < 2;
        if (!okSize) message.error("Ảnh phải nhỏ hơn 2MB!");
        return okType && okSize;
    };

    const handleChange = (info: any) => {
        if (info.file.status === "uploading") setLoadingUpload(true);
        if (info.file.status === "done" || info.file.status === "error") setLoadingUpload(false);
    };

    const handleUploadThumb = async ({ file, onSuccess, onError }: any) => {
        try {
            const res = await callUploadSingleFile(file, "blog", "image");
            if (res?.data) {
                setThumb([{ name: res.data.fileName, uid: uuidv4() }]);
                onSuccess?.("ok");
            } else {
                setThumb([]);
                onError?.({ event: new Error(res?.message) });
            }
        } catch (e: any) {
            setThumb([]);
            onError?.({ event: e });
        }
    };

    return (
        <>
            {openModal && (
                <>
                    <ModalForm
                        title={<>{dataInit?.id ? "Cập nhật Blog" : "Tạo mới Blog"}</>}
                        open={openModal}
                        modalProps={{
                            onCancel: () => handleReset(),
                            afterClose: () => handleReset(),
                            destroyOnClose: true,
                            width: isMobile ? "100%" : 900,
                            footer: null,
                            keyboard: false,
                            maskClosable: false,
                            className: `modal-blog ${animation}`,
                            rootClassName: `modal-blog-root ${animation}`,
                        }}
                        scrollToFirstError
                        preserve={false}
                        form={form}
                        onFinish={submit}
                        initialValues={
                            dataInit?.id
                                ? {
                                    title: dataInit.title,
                                    description: dataInit.description,
                                    companyId: dataInit.company?.id ?? 0,
                                    published: dataInit.published ? 1 : 0,
                                }
                                : {
                                    published: 0,
                                    companyId: isHR && myCompanyId !== undefined ? Number(myCompanyId) : 0,
                                }
                        }
                        submitter={{
                            submitButtonProps: { icon: <CheckSquareOutlined /> },
                            searchConfig: { resetText: "Hủy", submitText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</> },
                        }}
                    >
                        <Row gutter={16}>
                            <Col span={24}>
                                <ProFormText
                                    label="Tiêu đề"
                                    name="title"
                                    rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
                                    placeholder="Nhập tiêu đề bài viết"
                                />
                            </Col>

                            <Col span={24}>
                                <ProFormTextArea
                                    label="Mô tả ngắn"
                                    name="description"
                                    placeholder="Nhập mô tả ngắn"
                                    fieldProps={{ maxLength: 300, autoSize: { minRows: 2 } }}
                                />
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    labelCol={{ span: 24 }}
                                    label="Thumbnail"
                                    name="thumbnail"
                                    rules={[
                                        {
                                            required: true,
                                            validator: () => (thumb.length > 0 ? Promise.resolve() : Promise.reject(false)),
                                            message: "Vui lòng upload thumbnail",
                                        },
                                    ]}
                                >
                                    <ConfigProvider locale={enUS}>
                                        <Upload
                                            name="thumbnail"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            maxCount={1}
                                            multiple={false}
                                            customRequest={handleUploadThumb}
                                            beforeUpload={beforeUpload}
                                            onChange={handleChange}
                                            onRemove={handleRemoveFile}
                                            onPreview={handlePreview}
                                            defaultFileList={
                                                dataInit?.id && dataInit?.thumbnail
                                                    ? [
                                                        {
                                                            uid: uuidv4(),
                                                            name: dataInit?.thumbnail ?? "",
                                                            status: "done",
                                                            url: dataInit?.thumbnail,
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
                                <ProFormSelect
                                    label="Thuộc công ty"
                                    name="companyId"
                                    placeholder={isHR ? "Công ty của bạn" : "Chọn công ty hoặc Hệ thống"}
                                    fieldProps={{
                                        options: isHR ? companyOpts : [{ label: "Hệ thống", value: 0 }, ...companyOpts],
                                        loading: loadingCompany,
                                        showSearch: !isHR,
                                        filterOption: false,
                                        onSearch: handleSearchCompany,
                                        allowClear: !isHR,
                                        disabled: isHR,
                                    }}
                                    rules={[
                                        {
                                            required: true,
                                            validator: (_, v) => {
                                                if (isHR) {
                                                    if (myCompanyId === undefined) {
                                                        return Promise.reject("HR chưa thuộc công ty nào");
                                                    }
                                                    return Number(v) === Number(myCompanyId)
                                                        ? Promise.resolve()
                                                        : Promise.reject("HR chỉ được đăng bài cho công ty của mình");
                                                }
                                                return v === 0 || v > 0
                                                    ? Promise.resolve()
                                                    : Promise.reject("Vui lòng chọn công ty hoặc Hệ thống");
                                            },
                                        },
                                    ]}
                                />
                            </Col>


                            {!isHR && (
                                <Col span={24}>
                                    <ProFormRadio.Group
                                        label="Trạng thái"
                                        name="published"
                                        options={[
                                            { label: "Draft", value: 0 },
                                            { label: "Published", value: 1 },
                                        ]}
                                    />
                                </Col>
                            )}

                            <ProCard title="Nội dung" headStyle={{ color: "#d81921" }} headerBordered size="small" bordered>
                                <Col span={24}>
                                    <ReactQuill theme="snow" value={content} onChange={setContent} />
                                </Col>
                            </ProCard>
                        </Row>
                    </ModalForm>

                    <Modal
                        open={previewOpen}
                        title={previewTitle}
                        footer={null}
                        onCancel={() => setPreviewOpen(false)}
                        style={{ zIndex: 1500 }}
                    >
                        <img alt="example" style={{ width: "100%" }} src={previewImage} />
                    </Modal>
                </>
            )}
        </>
    );
};

export default ModalBlog;
