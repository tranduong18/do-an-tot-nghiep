import {
    ProForm,
    ProFormText,
    ProFormDigit,
    ProFormSelect,
} from "@ant-design/pro-components";
import { Card, Form, Upload, message, ConfigProvider, Button } from "antd";
import { LoadingOutlined, PlusOutlined, UploadOutlined, FilePdfOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { callUpdateUser, callUploadSingleFile } from "@/config/api";
import { v4 as uuidv4 } from "uuid";
import viVN from "antd/lib/locale/vi_VN";
import { IUser } from "@/types/backend";
import { setUserLoginInfo } from "@/redux/slice/accountSlide";
import { setUserDetail } from "@/redux/slice/userDetailSlide";

interface IProps {
    dataInit: IUser | null;
    setDataInit: (user: IUser | null) => void;
    open: boolean;
    onClose: (v: boolean) => void;
}

const UserUpdateInfo = (props: IProps) => {
    const { dataInit, setDataInit, onClose } = props;
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();

    const accountUser = useAppSelector((s) => s.account.user) as IUser;
    const userDetail = useAppSelector((s) => s.userDetail.user) as IUser;

    const [loadingUpload, setLoadingUpload] = useState(false);
    const [avatarFile, setAvatarFile] = useState<any[]>([]);
    const [cvFile, setCvFile] = useState<any[]>([]); // NEW

    useEffect(() => {
        if (!dataInit) return;
        form.setFieldsValue({
            name: dataInit.name,
            age: dataInit.age,
            gender: dataInit.gender,
            address: dataInit.address,
        });

        if (dataInit.avatar) {
            setAvatarFile([
                { uid: uuidv4(), name: dataInit.avatar, status: "done", url: dataInit.avatar },
            ]);
        }
        if (dataInit.cvUrl) {
            setCvFile([
                { uid: uuidv4(), name: dataInit.cvUrl, status: "done", url: dataInit.cvUrl },
            ]);
        }
    }, [dataInit]);

    const handleUploadAvatar = async ({ file, onSuccess, onError }: any) => {
        try {
            setLoadingUpload(true);
            const res = await callUploadSingleFile(file, "avatar", "image");
            setAvatarFile([{ uid: uuidv4(), name: res.data?.fileName, status: "done", url: res.data?.fileName }]);
            onSuccess?.("ok");
        } catch (e: any) {
            setAvatarFile([]);
            onError?.(new Error(e?.message || "Upload lỗi"));
        } finally {
            setLoadingUpload(false);
        }
    };

    const handleUploadCV = async ({ file, onSuccess, onError }: any) => {
        try {
            const res = await callUploadSingleFile(file, "resume", "file");
            setCvFile([{ uid: uuidv4(), name: res.data?.fileName, status: "done", url: res.data?.fileName }]);
            onSuccess?.("ok");
        } catch (e: any) {
            setCvFile([]);
            onError?.(new Error(e?.message || "Upload CV lỗi"));
        }
    };

    const onFinish = async (values: any) => {
        if (avatarFile.length === 0) {
            message.error("Vui lòng upload ảnh đại diện");
            return;
        }

        const payload: IUser = {
            id: accountUser.id,
            ...values,
            avatar: avatarFile[0].name,
            cvUrl: cvFile[0]?.name,
        };

        const res = await callUpdateUser(payload);
        if (res.data) {
            message.success("Cập nhật thông tin thành công");
            setDataInit(res.data);
        }

        dispatch(setUserLoginInfo({ ...accountUser, ...values }));
        dispatch(setUserDetail({ ...userDetail, ...values, avatar: avatarFile[0].name, cvUrl: cvFile[0]?.name }));
    };

    return (
        <ConfigProvider locale={viVN}>
            <Card style={{ maxWidth: 600, margin: "0 auto" }}>
                <ProForm
                    form={form}
                    onFinish={onFinish}
                    submitter={{
                        searchConfig: { submitText: "Cập nhật", resetText: "Hủy" },
                        resetButtonProps: { onClick: () => onClose(false) },
                    }}
                >
                    <ProFormText name="name" label="Họ và tên" rules={[{ required: true, message: "Vui lòng không bỏ trống" }]} />
                    <ProFormDigit name="age" label="Tuổi" rules={[{ required: true, message: "Vui lòng không bỏ trống" }]} />
                    <ProFormSelect
                        name="gender"
                        label="Giới tính"
                        valueEnum={{ MALE: "Nam", FEMALE: "Nữ", OTHER: "Khác" }}
                        rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
                    />
                    <ProFormText name="address" label="Địa chỉ" rules={[{ required: true, message: "Vui lòng không bỏ trống" }]} />

                    <Form.Item
                        label="Ảnh đại diện"
                        name="avatar"
                        rules={[{
                            required: true,
                            validator: () => (avatarFile.length > 0 ? Promise.resolve() : Promise.reject("Vui lòng upload ảnh")),
                        }]}
                    >
                        <Upload
                            name="avatar"
                            listType="picture-card"
                            maxCount={1}
                            customRequest={handleUploadAvatar}
                            onRemove={() => setAvatarFile([])}
                            fileList={avatarFile}
                            accept="image/*"
                        >
                            <div>
                                {loadingUpload ? <LoadingOutlined /> : <PlusOutlined />}
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        </Upload>
                    </Form.Item>

                    {/* NEW: Upload CV (pdf/doc/docx) */}
                    <Form.Item label="CV (PDF/DOC)" name="cvUrl">
                        <Upload
                            name="cv"
                            listType="text"
                            maxCount={1}
                            customRequest={handleUploadCV}
                            onRemove={() => setCvFile([])}
                            fileList={cvFile}
                            accept="application/pdf,application/msword,.doc,.docx,.pdf"
                            onChange={(info) => {
                                if (info.file.status === "done") message.success(`${info.file.name} uploaded successfully`);
                                if (info.file.status === "error") message.error(info?.file?.error?.event?.message ?? "Upload CV lỗi");
                            }}
                        >
                            <Button icon={<UploadOutlined />}>Tải lên CV của bạn (Hỗ trợ *.doc, *.docx, *.pdf &lt; 5MB)</Button>
                        </Upload>

                        {cvFile?.[0]?.url && (
                            <a
                                href={cvFile[0].url}
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: "inline-block", marginTop: 8 }}
                            >
                                <FilePdfOutlined /> Xem CV hiện tại
                            </a>
                        )}
                    </Form.Item>
                </ProForm>
            </Card>
        </ConfigProvider>
    );
};

export default UserUpdateInfo;
