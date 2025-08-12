import { Button, Descriptions, Drawer, Form, Select, Input, DatePicker, message, notification } from "antd";
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { IResume } from "@/types/backend";
import { callUpdateResumeStatusV2 } from "@/config/api";

const { Option } = Select;
const { TextArea } = Input;

interface IProps {
    onClose: (v: boolean) => void;
    open: boolean;
    dataInit: IResume | null | any;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

const STATUS_LABEL: Record<string, string> = {
    PENDING: 'Chờ duyệt',
    REVIEWING: 'Đang xem xét',
    APPROVED: 'Đã phê duyệt',
    REJECTED: 'Từ chối',
};

const ViewDetailResume = (props: IProps) => {
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const { onClose, open, dataInit, setDataInit, reloadTable } = props;
    const [form] = Form.useForm();

    useEffect(() => {
        if (dataInit) {
            form.setFieldsValue({
                status: dataInit.status,
                interviewAt: dataInit.interviewAt ? dayjs(dataInit.interviewAt) : undefined,
                interviewLocation: dataInit.interviewLocation,
                interviewNote: dataInit.interviewNote,
                rejectReason: dataInit.rejectReason,
            });
        }
        return () => form.resetFields();
    }, [dataInit]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setIsSubmit(true);

            const payload: any = {
                id: dataInit?.id,
                status: values.status,
            };

            if (values.status === 'APPROVED') {
                payload.interviewAt = values.interviewAt ? values.interviewAt.toDate().toISOString() : undefined;
                payload.interviewLocation = values.interviewLocation;
                payload.interviewNote = values.interviewNote;
            } else if (values.status === 'REJECTED') {
                payload.rejectReason = values.rejectReason;
            }

            const res = await callUpdateResumeStatusV2(payload);
            if (res?.data) {
                message.success("Cập nhật trạng thái & gửi email/Thông báo thành công");
                setDataInit(null);
                onClose(false);
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: (res as any)?.message || 'Không thể cập nhật'
                });
            }
        } catch {
            // bỏ qua lỗi validate
        } finally {
            setIsSubmit(false);
        }
    };

    const status = Form.useWatch('status', form);

    return (
        <Drawer
            title="Thông Tin Resume"
            placement="right"
            onClose={() => { onClose(false); setDataInit(null) }}
            open={open}
            width={"42vw"}
            maskClosable={false}
            destroyOnClose
            extra={<Button loading={isSubmit} type="primary" onClick={handleSubmit}>Lưu</Button>}
        >
            <Descriptions bordered column={2} layout="vertical">
                <Descriptions.Item label="Email">{dataInit?.email}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                    <Form form={form} layout="vertical">
                        <Form.Item name="status" rules={[{ required: true, message: 'Chọn trạng thái' }]}>
                            <Select style={{ width: "100%" }}>
                                <Option value="PENDING">{STATUS_LABEL.PENDING}</Option>
                                <Option value="REVIEWING">{STATUS_LABEL.REVIEWING}</Option>
                                <Option value="APPROVED">{STATUS_LABEL.APPROVED}</Option>
                                <Option value="REJECTED">{STATUS_LABEL.REJECTED}</Option>
                            </Select>
                        </Form.Item>

                        {status === 'APPROVED' && (
                            <>
                                <Form.Item
                                    name="interviewAt"
                                    label="Thời gian phỏng vấn"
                                    rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
                                >
                                    <DatePicker showTime style={{ width: '100%' }} />
                                </Form.Item>

                                <Form.Item
                                    name="interviewLocation"
                                    label="Địa điểm / Link"
                                    rules={[{ required: true, message: 'Vui lòng nhập địa điểm hoặc link' }]}
                                >
                                    <Input placeholder="VD: Tầng 10, 123 Hai Bà Trưng, Q1 / Google Meet link..." />
                                </Form.Item>

                                <Form.Item name="interviewNote" label="Ghi chú">
                                    <TextArea rows={3} placeholder="Những lưu ý cho ứng viên (mang laptop, người phỏng vấn...)" />
                                </Form.Item>
                            </>
                        )}

                        {status === 'REJECTED' && (
                            <Form.Item name="rejectReason" label="Lý do từ chối">
                                <TextArea rows={3} placeholder="VD: Không phù hợp JD, thiếu kinh nghiệm microservices..." />
                            </Form.Item>
                        )}
                    </Form>
                </Descriptions.Item>

                <Descriptions.Item label="Tên Job">{dataInit?.job?.name}</Descriptions.Item>
                <Descriptions.Item label="Tên Công Ty">{dataInit?.companyName}</Descriptions.Item>

                <Descriptions.Item label="Ngày tạo">
                    {dataInit?.createdAt ? dayjs(dataInit.createdAt).format('DD-MM-YYYY HH:mm:ss') : ""}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày sửa">
                    {dataInit?.updatedAt ? dayjs(dataInit.updatedAt).format('DD-MM-YYYY HH:mm:ss') : ""}
                </Descriptions.Item>

                <Descriptions.Item label="CV" span={2}>
                    {dataInit?.url ? (
                        <a href={dataInit.url} target="_blank" rel="noopener noreferrer">Xem CV</a>
                    ) : "—"}
                </Descriptions.Item>
            </Descriptions>
        </Drawer>
    );
};

export default ViewDetailResume;
