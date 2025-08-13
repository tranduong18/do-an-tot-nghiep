import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProForm, ProFormText } from "@ant-design/pro-components";
import {
    Button,
    Col,
    ConfigProvider,
    Divider,
    Modal,
    Row,
    Upload,
    message,
    notification,
    Radio,
    Space,
    Alert,
} from "antd";
import type { UploadProps } from "antd";
import enUS from "antd/lib/locale/en_US";
import { UploadOutlined, FilePdfOutlined, CheckCircleTwoTone, LoadingOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setUserDetail } from "@/redux/slice/userDetailSlide";
import { callCreateResume, callUploadSingleFile, callGetUserById } from "@/config/api";
import { IJob, IUser } from "@/types/backend";

interface IProps {
    isModalOpen: boolean;
    setIsModalOpen: (v: boolean) => void;
    jobDetail: IJob | null;
}

type CvMode = "existing" | "new";

const ApplyModal = (props: IProps) => {
    const { isModalOpen, setIsModalOpen, jobDetail } = props;

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const isAuthenticated = useAppSelector((s) => s.account.isAuthenticated);
    const accountUser = useAppSelector((s) => s.account.user) as IUser; // dùng email/id
    const userDetail = useAppSelector((s) => s.userDetail.user) as IUser; // chứa cvUrl

    const savedCvUrl = useMemo(() => userDetail?.cvUrl || "", [userDetail]);

    const [mode, setMode] = useState<CvMode>("existing");
    const [urlCV, setUrlCV] = useState<string>("");
    const [fileList, setFileList] = useState<any[]>([]);

    // trạng thái upload UI (xoay + check)
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);

    // 1) Khi mở modal: nếu đã login mà userDetail chưa có => fetch
    useEffect(() => {
        const fetchDetail = async () => {
            if (!isModalOpen || !isAuthenticated) return;
            if (userDetail?.id) return;
            if (!accountUser?.id) return;

            try {
                const res = await callGetUserById(accountUser.id);
                if (res?.data) dispatch(setUserDetail(res.data));
            } catch {
                // ignore
            }
        };
        fetchDetail();
    }, [isModalOpen, isAuthenticated, accountUser?.id]);

    // 2) Mỗi lần mở modal: preset theo savedCvUrl
    useEffect(() => {
        if (!isModalOpen) return;
        if (savedCvUrl) {
            setMode("existing");
            setUrlCV(savedCvUrl);
            setFileList([]);
            setUploaded(false);
            setUploading(false);
        } else {
            setMode("new");
            setUrlCV("");
            setFileList([]);
            setUploaded(false);
            setUploading(false);
        }
    }, [isModalOpen, savedCvUrl]);

    const handleOkButton = async () => {
        if (!isAuthenticated) {
            setIsModalOpen(false);
            navigate(`/login?callback=${window.location.href}`);
            return;
        }
        if (!urlCV) {
            message.error("Vui lòng chọn CV (dùng CV đã lưu hoặc tải CV mới)!");
            return;
        }
        if (jobDetail) {
            const res = await callCreateResume(urlCV, jobDetail.id, accountUser.email, accountUser.id as string);
            if (res.data) {
                message.success("Rải CV thành công!");
                setIsModalOpen(false);
            } else {
                notification.error({ message: "Có lỗi xảy ra", description: res.message });
            }
        }
    };

    const propsUpload: UploadProps = {
        maxCount: 1,
        multiple: false,
        accept: "application/pdf,application/msword,.doc,.docx,.pdf",
        showUploadList: false,
        async customRequest({ file, onSuccess, onError }: any) {
            try {
                setUploading(true);
                setUploaded(false);
                const res = await callUploadSingleFile(file, "resume", "file");
                if (res && res.data) {
                    setUrlCV(res.data.fileName);
                    setFileList([
                        {
                            uid: Date.now().toString(),
                            name: res.data.fileName,
                            status: "done",
                            url: res.data.fileName,
                        },
                    ]);
                    message.success("Tải CV thành công!");
                    setUploaded(true);
                    onSuccess?.("ok");
                } else {
                    throw new Error(res?.message || "Upload lỗi");
                }
            } catch (e: any) {
                setUrlCV("");
                setFileList([]);
                message.error(e?.message || "Đã có lỗi xảy ra khi upload file.");
                onError?.(new Error(e?.message || "Upload lỗi"));
            } finally {
                setUploading(false);
            }
        },
        onRemove() {
            setUrlCV("");
            setFileList([]);
            setUploaded(false);
        },
        onChange(info) {
            // dự phòng nếu không chạy vào onSuccess của customRequest
            if (info.file.status === "done") {
                message.success(`${info.file.name} uploaded successfully`);
                setUploaded(true);
                setUploading(false);
            } else if (info.file.status === "error") {
                message.error(info?.file?.error?.event?.message ?? "Đã có lỗi xảy ra khi upload file.");
                setUploading(false);
                setUploaded(false);
            }
        },
        fileList,
    };

    return (
        <Modal
            title="Ứng Tuyển Job"
            open={isModalOpen}
            onOk={handleOkButton}
            onCancel={() => setIsModalOpen(false)}
            maskClosable={false}
            okText={isAuthenticated ? "Rải CV Nào" : "Đăng Nhập Nhanh"}
            cancelButtonProps={{ style: { display: "none" } }}
            destroyOnClose
            okButtonProps={{ disabled: uploading }} // tránh submit khi đang upload
        >
            <Divider />
            {isAuthenticated ? (
                <div>
                    <ConfigProvider locale={enUS}>
                        <ProForm submitter={{ render: () => <></> }}>
                            <Row gutter={[10, 10]}>
                                <Col span={24}>
                                    <div>
                                        Bạn đang ứng tuyển công việc <b>{jobDetail?.name}</b> tại <b>{jobDetail?.company?.name}</b>
                                    </div>
                                </Col>
                                <Col span={24}>
                                    <ProFormText
                                        fieldProps={{ type: "email" }}
                                        label="Email"
                                        name="email"
                                        labelAlign="right"
                                        disabled
                                        initialValue={accountUser?.email}
                                    />
                                </Col>

                                {/* Chọn nguồn CV */}
                                <Col span={24}>
                                    <Space direction="vertical" style={{ width: "100%" }}>
                                        <Radio.Group
                                            value={mode}
                                            onChange={(e) => {
                                                const next = e.target.value as CvMode;
                                                setMode(next);
                                                if (next === "existing") {
                                                    if (savedCvUrl) setUrlCV(savedCvUrl);
                                                    else {
                                                        message.info("Bạn chưa lưu CV trong hồ sơ. Vui lòng tải mới.");
                                                        setMode("new");
                                                    }
                                                    setFileList([]);
                                                    setUploaded(false);
                                                    setUploading(false);
                                                } else {
                                                    setUrlCV("");
                                                    setUploaded(false);
                                                    setUploading(false);
                                                }
                                            }}
                                        >
                                            <Radio value="existing" disabled={!savedCvUrl}>
                                                Dùng CV đã lưu
                                            </Radio>
                                            <Radio value="new">Tải CV mới</Radio>
                                        </Radio.Group>

                                        {mode === "existing" && savedCvUrl && (
                                            <Alert
                                                type="success"
                                                showIcon
                                                message={
                                                    <span>
                                                        <CheckCircleTwoTone twoToneColor="#52c41a" /> Đang dùng CV đã lưu:&nbsp;
                                                        <a href={savedCvUrl} target="_blank" rel="noreferrer">
                                                            <FilePdfOutlined /> Xem CV
                                                        </a>
                                                    </span>
                                                }
                                            />
                                        )}

                                        {mode === "new" && (
                                            <ProForm.Item label="Upload file CV" rules={[{ required: true, message: "Vui lòng upload file!" }]}>
                                                <Space align="center" wrap>
                                                    <Upload {...propsUpload}>
                                                        <Button icon={uploading ? <LoadingOutlined /> : <UploadOutlined />} disabled={uploading}>
                                                            {uploading ? "Đang tải lên..." : "Tải lên CV của bạn (.doc, .docx, .pdf < 5MB)"}
                                                        </Button>
                                                    </Upload>
                                                    {uploaded && !uploading && <CheckCircleTwoTone twoToneColor="#52c41a" />}
                                                </Space>
                                            </ProForm.Item>
                                        )}
                                    </Space>
                                </Col>
                            </Row>
                        </ProForm>
                    </ConfigProvider>
                </div>
            ) : (
                <div>Bạn chưa đăng nhập hệ thống. Vui lòng đăng nhập để có thể "Rải CV" bạn nhé -.-</div>
            )}
            <Divider />
        </Modal>
    );
};

export default ApplyModal;
