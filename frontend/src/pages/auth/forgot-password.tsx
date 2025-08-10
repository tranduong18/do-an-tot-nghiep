import { Button, Divider, Form, Input, message, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import styles from 'styles/auth.module.scss';
import PageHelmet from '@/components/share/page.helmet';
import {
    callPasswordOtpRequest,
    callPasswordOtpResend,
    callPasswordOtpVerify,
    callPasswordReset
} from 'config/api';
import { Link, useNavigate } from 'react-router-dom';

const { Text } = Typography;

type Step = 'REQUEST' | 'VERIFY' | 'SUCCESS';

const getStatusCode = (res: any) =>
    Number(res?.statusCode ?? res?.data?.statusCode ?? res?.status ?? 0);

const isOk = (res: any) => {
    const code = getStatusCode(res);
    return code === 200 || code === 201;
};

const getMsg = (res: any, fallback: string) =>
    res?.data?.data?.message ??
    res?.data?.message ??
    res?.message ??
    fallback;

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('REQUEST');
    const [email, setEmail] = useState('');
    const [resetToken, setResetToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // countdown resend OTP
    const [cooldown, setCooldown] = useState(0);
    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setInterval(() => setCooldown((s) => s - 1), 1000);
        return () => clearInterval(t);
    }, [cooldown]);

    // STEP 1: gửi OTP
    const onSendOtp = async (values: any) => {
        const mail = values.email?.trim();
        if (!mail) return;
        try {
            setLoading(true);
            const res = await callPasswordOtpRequest(mail);
            setLoading(false);

            if (!isOk(res)) {
                message.error(getMsg(res, 'Tài khoản này không tồn tại'));
                return; // ở lại bước REQUEST
            }

            message.success(getMsg(res, 'Vui lòng kiểm tra email của bạn.'));
            setEmail(mail);
            setCooldown(60);
            setStep('VERIFY');
        } catch (e: any) {
            setLoading(false);
            message.error(e?.response?.data?.message || 'Không gửi được OTP. Thử lại sau!');
        }
    };

    // STEP 2: verify OTP + reset password
    const onVerifyAndReset = async (values: any) => {
        const { otp, password, confirmPassword } = values;
        if (password !== confirmPassword) {
            message.error('Xác nhận mật khẩu không khớp!');
            return;
        }
        try {
            setLoading(true);

            // verify OTP → lấy resetToken
            let token = resetToken;
            if (!token) {
                const r = await callPasswordOtpVerify(email, otp);
                if (!isOk(r)) {
                    message.error(getMsg(r, 'OTP không hợp lệ hoặc đã hết hạn.'));
                    setLoading(false);
                    return;
                }
                token = r?.data?.resetToken ?? null;
                setResetToken(token);
            }
            if (!token) {
                setLoading(false);
                return;
            }

            // reset password
            const res = await callPasswordReset(token, password);
            setLoading(false);

            if (!isOk(res)) {
                message.error(getMsg(res, 'Không thể đổi mật khẩu.'));
                return;
            }

            message.success(getMsg(res, 'Đổi mật khẩu thành công!'));
            setStep('SUCCESS');
            setTimeout(() => navigate('/login'), 800);
        } catch (e: any) {
            setLoading(false);
            message.error(e?.response?.data?.message || 'Không thể đổi mật khẩu. Thử lại!');
        }
    };

    const MaskedEmail = useMemo(() => {
        if (!email) return '';
        const [name, domain] = email.split('@');
        if (!domain) return email;
        const masked = name.length <= 2 ? name[0] + '*' : name[0] + '***' + name.slice(-1);
        return `${masked}@${domain}`;
    }, [email]);

    return (
        <>
            <PageHelmet title={'Quên mật khẩu'} />
            <div className={styles['login-page']}>
                <main className={styles.main}>
                    <div className={styles.container}>
                        <section className={styles.wrapper}>
                            <div className={styles.heading}>
                                <h2 className={`${styles.text} ${styles['text-large']}`}>Quên mật khẩu</h2>
                                <Divider />
                            </div>

                            {step === 'REQUEST' && (
                                <Form layout="vertical" onFinish={onSendOtp} autoComplete="off">
                                    <Form.Item
                                        label="Email đăng ký"
                                        name="email"
                                        rules={[
                                            { required: true, message: 'Email không được để trống!' },
                                            { type: 'email', message: 'Email không hợp lệ!' }
                                        ]}
                                    >
                                        <Input placeholder="vd: user@example.com" />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" loading={loading}>
                                            Gửi OTP
                                        </Button>
                                        <div style={{ marginTop: 8 }}>
                                            <Link to="/login">Quay lại đăng nhập</Link>
                                        </div>
                                    </Form.Item>
                                </Form>
                            )}

                            {step === 'VERIFY' && (
                                <Form layout="vertical" onFinish={onVerifyAndReset} autoComplete="off">
                                    <div style={{ marginBottom: 8 }}>
                                        <Text type="secondary">
                                            Chúng tôi đã gửi mã đến <b>{MaskedEmail}</b>
                                        </Text>
                                    </div>

                                    <Form.Item
                                        label="Mã OTP"
                                        name="otp"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập OTP!' },
                                            { len: 6, message: 'OTP gồm 6 chữ số' }
                                        ]}
                                    >
                                        <Input placeholder="Nhập 6 số OTP" maxLength={6} />
                                    </Form.Item>

                                    <Form.Item
                                        label="Mật khẩu mới"
                                        name="password"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                            { min: 6, message: 'Tối thiểu 6 ký tự' }
                                        ]}
                                    >
                                        <Input.Password placeholder="••••••" />
                                    </Form.Item>

                                    <Form.Item
                                        label="Xác nhận mật khẩu"
                                        name="confirmPassword"
                                        rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu!' }]}
                                    >
                                        <Input.Password placeholder="Nhập lại mật khẩu" />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" loading={loading}>
                                            Xác thực & Đặt lại mật khẩu
                                        </Button>

                                        <Button
                                            style={{ marginLeft: 12 }}
                                            disabled={cooldown > 0}
                                            onClick={async () => {
                                                try {
                                                    const r = await callPasswordOtpResend(email);
                                                    if (!isOk(r)) {
                                                        message.error(getMsg(r, 'Không gửi lại được OTP.'));
                                                        return;
                                                    }
                                                    message.success(getMsg(r, 'Đã gửi lại OTP.'));
                                                    setCooldown(60);
                                                } catch (e: any) {
                                                    message.error(e?.response?.data?.message || 'Không gửi lại được OTP.');
                                                }
                                            }}
                                        >
                                            {cooldown > 0 ? `Gửi lại (${cooldown}s)` : 'Gửi lại OTP'}
                                        </Button>

                                        <div style={{ marginTop: 8 }}>
                                            <Link to="/login">Quay lại đăng nhập</Link>
                                        </div>
                                    </Form.Item>
                                </Form>
                            )}

                            {step === 'SUCCESS' && (
                                <>
                                    <Text strong>Đổi mật khẩu thành công.</Text>
                                    <div style={{ marginTop: 12 }}>
                                        <Link to="/login">Đến trang đăng nhập</Link>
                                    </div>
                                </>
                            )}
                        </section>
                    </div>
                </main>
            </div>
        </>
    );
}

export default ForgotPasswordPage;