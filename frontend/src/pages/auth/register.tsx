import { Button, Divider, Form, Input, Select, message, notification } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { callRegister } from 'config/api';
import styles from 'styles/auth.module.scss';
import PageHelmet from '@/components/share/page.helmet';
import { IUser } from '@/types/backend';

const { Option } = Select;

type FormValues = IUser & {
    accountType?: 'Candidate' | 'HR';
    companyName?: string;
    companyAddress?: string;
};

const RegisterPage = () => {
    const navigate = useNavigate();
    const [isSubmit, setIsSubmit] = useState(false);
    const [form] = Form.useForm<FormValues>();
    const accountType = Form.useWatch('accountType', form);

    const onFinish = async (values: FormValues) => {
        const {
            name, email, password, age, gender, address,
            accountType, companyName, companyAddress
        } = values;

        setIsSubmit(true);
        const res = await callRegister(
            name,
            email,
            (password || '') as string,
            Number(age),
            gender,
            address,
            (accountType || 'Candidate') as 'Candidate' | 'HR',
            companyName,
            companyAddress
        );
        setIsSubmit(false);

        if (res?.data?.id) {
            message.success('Đăng ký tài khoản thành công!');
            navigate('/login');
        } else {
            const errorMsg = Array.isArray(res?.message) ? res.message[0] : res?.message || 'Vui lòng kiểm tra lại thông tin.';
            notification.error({ message: 'Có lỗi xảy ra', description: errorMsg, duration: 5 });
        }
    };

    return (
        <>
            <PageHelmet title={'Đăng ký'} />
            <div className={styles['register-page']}>
                <main className={styles.main}>
                    <div className={styles.container}>
                        <section className={styles.wrapper}>
                            <div className={styles.heading}>
                                <h2 className={`${styles.text} ${styles['text-large']}`}>Đăng Ký Tài Khoản</h2>
                                <Divider />
                            </div>

                            <Form<FormValues> form={form} name="register" onFinish={onFinish} autoComplete="off">
                                {/* Loại tài khoản */}
                                <Form.Item
                                    labelCol={{ span: 24 }}
                                    label="Loại tài khoản"
                                    name="accountType"
                                    initialValue="Candidate"
                                    rules={[{ required: true, message: 'Vui lòng chọn loại tài khoản!' }]}
                                >
                                    <Select allowClear>
                                        <Option value="Candidate">Ứng viên</Option>
                                        <Option value="HR">Nhà tuyển dụng (HR)</Option>
                                    </Select>
                                </Form.Item>

                                {/* Họ tên */}
                                <Form.Item
                                    labelCol={{ span: 24 }}
                                    label="Họ tên"
                                    name="name"
                                    rules={[{ required: true, message: 'Họ tên không được để trống!' }]}
                                >
                                    <Input />
                                </Form.Item>

                                {/* Email */}
                                <Form.Item
                                    labelCol={{ span: 24 }}
                                    label="Email"
                                    name="email"
                                    rules={[
                                        { required: true, message: 'Email không được để trống!' },
                                        { type: 'email', message: 'Email không hợp lệ!' }
                                    ]}
                                >
                                    <Input type="email" />
                                </Form.Item>

                                {/* Mật khẩu */}
                                <Form.Item
                                    labelCol={{ span: 24 }}
                                    label="Mật khẩu"
                                    name="password"
                                    rules={[
                                        { required: true, message: 'Mật khẩu không được để trống!' },
                                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                                    ]}
                                >
                                    <Input.Password />
                                </Form.Item>

                                {/* Tuổi */}
                                <Form.Item
                                    labelCol={{ span: 24 }}
                                    label="Tuổi"
                                    name="age"
                                    rules={[{ required: true, message: 'Tuổi không được để trống!' }]}
                                >
                                    <Input type="number" />
                                </Form.Item>

                                {/* Giới tính */}
                                <Form.Item
                                    labelCol={{ span: 24 }}
                                    name="gender"
                                    label="Giới tính"
                                    rules={[{ required: true, message: 'Giới tính không được để trống!' }]}
                                >
                                    <Select allowClear>
                                        <Option value="MALE">Nam</Option>
                                        <Option value="FEMALE">Nữ</Option>
                                        <Option value="OTHER">Khác</Option>
                                    </Select>
                                </Form.Item>

                                {/* Địa chỉ */}
                                <Form.Item
                                    labelCol={{ span: 24 }}
                                    label="Địa chỉ"
                                    name="address"
                                    rules={[{ required: true, message: 'Địa chỉ không được để trống!' }]}
                                >
                                    <Input />
                                </Form.Item>

                                {/* Trường công ty chỉ khi HR */}
                                {accountType === 'HR' && (
                                    <>
                                        <Form.Item
                                            labelCol={{ span: 24 }}
                                            label="Tên công ty"
                                            name="companyName"
                                            rules={[{ required: true, message: 'Tên công ty không được để trống!' }]}
                                        >
                                            <Input />
                                        </Form.Item>

                                        <Form.Item
                                            labelCol={{ span: 24 }}
                                            label="Địa chỉ công ty"
                                            name="companyAddress"
                                            rules={[{ required: true, message: 'Địa chỉ công ty không được để trống!' }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </>
                                )}

                                <Form.Item>
                                    <Button type="primary" htmlType="submit" loading={isSubmit}>
                                        Đăng ký
                                    </Button>
                                </Form.Item>

                                <Divider>Or</Divider>
                                <p className="text text-normal">
                                    Đã có tài khoản?
                                    <span>
                                        <Link to="/login"> Đăng Nhập</Link>
                                    </span>
                                </p>
                            </Form>
                        </section>
                    </div>
                </main>
            </div>
        </>
    );
};

export default RegisterPage;
