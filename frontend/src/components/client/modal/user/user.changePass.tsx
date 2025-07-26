import {
    ProForm,
    ProFormText,
} from "@ant-design/pro-components";
import { Card, message, ConfigProvider } from "antd";
import viVN from "antd/lib/locale/vi_VN";
import { callChangePassword } from "@/config/api";

interface IChangePasswordForm {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface IProps {
    open: boolean;
    onClose: (v: boolean) => void;
}

const UserChangePassword = (props: IProps) => {
    const { open, onClose } = props;
    const onFinish = async (values: IChangePasswordForm) => {
        if (values.newPassword !== values.confirmPassword) {
            message.error("Mật khẩu xác nhận không khớp");
            return false;
        }

        try {
            const res = await callChangePassword(values.currentPassword, values.newPassword);
            if (res.statusCode === 200) {
                message.success("Đổi mật khẩu thành công");
                return true;
            } else {
                message.error(res.message || "Đổi mật khẩu thất bại");
                return false;
            }
        } catch (err: any) {
            message.error("Có lỗi xảy ra, vui lòng thử lại");
            return false;
        }
    };

    return (
        <ConfigProvider locale={viVN}>
            <Card style={{ maxWidth: 600, margin: "0 auto" }}>
                <ProForm
                    onFinish={onFinish}
                    submitter={{
                        searchConfig: { submitText: "Đổi mật khẩu", resetText: "Hủy" },
                        resetButtonProps: {
                            onClick: () => onClose(false),
                        },
                    }}
                >
                    <ProFormText.Password
                        name="currentPassword"
                        label="Mật khẩu hiện tại"
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
                        placeholder="Nhập mật khẩu hiện tại"
                    />
                    <ProFormText.Password
                        name="newPassword"
                        label="Mật khẩu mới"
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }]}
                        placeholder="Nhập mật khẩu mới"
                    />
                    <ProFormText.Password
                        name="confirmPassword"
                        label="Xác nhận mật khẩu mới"
                        rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu mới" }]}
                        placeholder="Nhập lại mật khẩu mới"
                    />
                </ProForm>
            </Card>
        </ConfigProvider>
    );
};

export default UserChangePassword;
