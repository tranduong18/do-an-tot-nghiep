import {
    ProForm,
    ProFormText,
    ProFormDigit,
    ProFormSelect,
} from "@ant-design/pro-components";
import { Card, Form, Upload, message, ConfigProvider } from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { callUpdateUser, callUploadSingleFile } from "@/config/api";
import { v4 as uuidv4 } from "uuid";
import viVN from "antd/lib/locale/vi_VN";
import { IUser } from "@/types/backend";
import { useAppDispatch } from "@/redux/hooks";
import { setUserLoginInfo } from "@/redux/slice/accountSlide";
import { setUserDetail } from "@/redux/slice/userDetailSlide";

interface IProps {
    dataInit: IUser | null;
    setDataInit: (user: IUser | null) => void;
    open: boolean;
    onClose: (v: boolean) => void;
}

const UserUpdateInfo = (props: IProps) => {
    const { dataInit, setDataInit, open, onClose } = props;
    const user = useAppSelector((state) => state.account.user) as IUser;
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const accountUser = useAppSelector((state) => state.account.user);
    const userDetail = useAppSelector((state) => state.userDetail.user);
    const [loadingUpload, setLoadingUpload] = useState(false);
    const [avatarFile, setAvatarFile] = useState<any[]>([]);

    useEffect(() => {
        if (dataInit) {
            form.setFieldsValue({
                name: dataInit.name,
                age: dataInit.age,
                gender: dataInit.gender,
                address: dataInit.address,
            });

            if (dataInit.avatar) {
                setAvatarFile([
                    {
                        uid: uuidv4(),
                        name: dataInit.avatar,
                        status: "done",
                        url: dataInit.avatar,
                    },
                ]);
            }
        }
    }, [dataInit]);

    const handleUploadAvatar = async ({ file, onSuccess, onError }: any) => {
        const res = await callUploadSingleFile(file, "avatar", "image");
        if (res && res.data) {
            setAvatarFile([
                { uid: uuidv4(), name: res.data.fileName, status: "done", url: res.data.fileName },
            ]);
            if (onSuccess) onSuccess("ok");
        } else {
            setAvatarFile([]);
            if (onError) onError(new Error(res?.message || "Upload lỗi"));
        }
    };

    const onFinish = async (values: any) => {
        if (avatarFile.length === 0) {
            message.error("Vui lòng upload ảnh đại diện");
            return;
        }

        const res = await callUpdateUser({
            id: user.id,
            ...values,
            avatar: avatarFile[0].name,
        });

        if (res.data) {
            message.success("Cập nhật thông tin thành công");
            setDataInit(res.data);
        }

        dispatch(setUserLoginInfo({
            ...accountUser,
            ...values
        }));

        dispatch(setUserDetail({
            ...userDetail,
            ...values,
            avatar: avatarFile[0].name,
        }));

    };

    return (
        <ConfigProvider locale={viVN}>
            <Card style={{ maxWidth: 600, margin: "0 auto" }}>
                <ProForm
                    form={form}
                    onFinish={onFinish}
                    submitter={{
                        searchConfig: { submitText: "Cập nhật", resetText: "Hủy" },
                        resetButtonProps: {
                            onClick: () => onClose(false),
                        },
                    }}
                >
                    <ProFormText
                        name="name"
                        label="Họ và tên"
                        rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
                        placeholder="Nhập họ tên"
                    />
                    <ProFormDigit
                        name="age"
                        label="Tuổi"
                        rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
                        placeholder="Nhập tuổi"
                    />
                    <ProFormSelect
                        name="gender"
                        label="Giới tính"
                        valueEnum={{ MALE: "Nam", FEMALE: "Nữ", OTHER: "Khác" }}
                        rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
                        placeholder="Chọn giới tính"
                    />
                    <ProFormText
                        name="address"
                        label="Địa chỉ"
                        rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
                        placeholder="Nhập địa chỉ"
                    />

                    <Form.Item
                        label="Ảnh đại diện"
                        name="avatar"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng upload ảnh đại diện",
                                validator: () =>
                                    avatarFile.length > 0
                                        ? Promise.resolve()
                                        : Promise.reject("Vui lòng upload ảnh"),
                            },
                        ]}
                    >
                        <Upload
                            name="avatar"
                            listType="picture-card"
                            maxCount={1}
                            customRequest={handleUploadAvatar}
                            onRemove={() => setAvatarFile([])}
                            fileList={avatarFile}
                        >
                            <div>
                                {loadingUpload ? <LoadingOutlined /> : <PlusOutlined />}
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        </Upload>
                    </Form.Item>
                </ProForm>
            </Card>
        </ConfigProvider>
    );
};

export default UserUpdateInfo;
