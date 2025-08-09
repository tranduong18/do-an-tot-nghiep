import { Avatar, Button, Col, Form, Modal, Popconfirm, Row, Select, Space, Table, Tabs, Tag, message, notification } from "antd";
import { isMobile } from "react-device-detect";
import type { TabsProps } from 'antd';
import { IFavoriteItem, IResume, ISubscribers, IUser } from "@/types/backend";
import { useState, useEffect, useRef } from 'react';
import { callCreateSubscriber, callFavoriteDelete, callFavoriteMyList, callFetchAllSkill, callFetchResumeByUser, callGetSubscriberSkills, callUpdateSubscriber } from "@/config/api";
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { DollarOutlined, EnvironmentOutlined, HeartFilled, MonitorOutlined } from "@ant-design/icons";
import { SKILLS_LIST } from "@/config/utils";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import UserUpdateInfo from "./user/user.update";
import { ActionType } from "@ant-design/pro-components";
import { fetchUserById } from "@/redux/slice/userDetailSlide";
import UserChangePassword from "./user/user.changePass";
import { useNavigate } from "react-router-dom";

interface IProps {
    open: boolean;
    onClose: (v: boolean) => void;
}

const UserResume = (props: any) => {
    const [listCV, setListCV] = useState<IResume[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    useEffect(() => {
        const init = async () => {
            setIsFetching(true);
            const res = await callFetchResumeByUser();
            if (res && res.data) {
                setListCV(res.data.result as IResume[])
            }
            setIsFetching(false);
        }
        init();
    }, [])

    const columns: ColumnsType<IResume> = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => {
                return (
                    <>
                        {(index + 1)}
                    </>)
            }
        },
        {
            title: 'Công Ty',
            dataIndex: "companyName",

        },
        {
            title: 'Việc ứng tuyển',
            dataIndex: ["job", "name"],

        },
        {
            title: 'Trạng thái',
            dataIndex: "status",
            render: (v) => {
                const color =
                    v === 'APPROVED' ? 'green' :
                        v === 'REJECTED' ? 'red' : 'gold';
                return <span style={{ color, fontWeight: 600 }}>{v}</span>;
            }
        },
        {
            title: 'Ngày rải CV',
            dataIndex: "createdAt",
            render(value, record, index) {
                return (
                    <>{dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss')}</>
                )
            },
        },
        {
            title: '',
            dataIndex: "",
            render(value, record, index) {
                return (
                    <a
                        href={record?.url}
                        target="_blank"
                    >Chi tiết</a>
                )
            },
        },
    ];

    return (
        <div>
            <Table<IResume>
                columns={columns}
                dataSource={listCV}
                loading={isFetching}
                pagination={false}
            />
        </div>
    )
}

const UserFavoriteJobs = () => {
    const [data, setData] = useState<IFavoriteItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();

    const fetchData = async (p = page, s = pageSize) => {
        setLoading(true);
        try {
            const query = `page=${p - 1}&size=${s}`;
            const res = await callFavoriteMyList(query);
            if (res && res.data) {
                setData(res.data.result || []);
                setTotal(res.data.meta?.total || 0);
            }
        } catch (e: any) {
            message.error("Không tải được danh sách yêu thích");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(1, pageSize);
    }, []);

    const handleUnfavorite = async (jobId: string) => {
        try {
            await callFavoriteDelete(jobId);
            message.success("Đã bỏ khỏi yêu thích");
            // nếu trang hiện tại hết dữ liệu sau khi xóa, lùi 1 trang
            const remain = data.length - 1;
            const nextPage = remain === 0 && page > 1 ? page - 1 : page;
            setPage(nextPage);
            fetchData(nextPage, pageSize);
        } catch (e) {
            message.error("Không thể cập nhật yêu thích. Thử lại sau.");
        }
    };

    const columns: ColumnsType<IFavoriteItem> = [
        {
            title: "STT",
            key: "idx",
            width: 60,
            align: "center",
            render: (_t, _r, idx) => (page - 1) * pageSize + idx + 1,
        },
        {
            title: "Công ty",
            dataIndex: "companyName",
            render: (_: any, record) => (
                <Space>

                    <span style={{ fontWeight: 600 }}>{record.companyName}</span>
                </Space>
            ),
        },
        {
            title: "Công việc",
            dataIndex: "name",
            render: (v: string, record) => (
                <a onClick={() => navigate(`/job/detail?id=${record.jobId}`)}>{v}</a>
            ),
        },
        {
            title: "Địa điểm",
            dataIndex: "location",
            render: (v: string) => (
                <Space><EnvironmentOutlined />{v}</Space>
            ),
        },
        {
            title: "Mức lương",
            dataIndex: "salary",
            render: (v: number) => (
                <Space><DollarOutlined />{(v ?? 0).toLocaleString()} đ</Space>
            ),
        },
        {
            title: "Hình thức",
            dataIndex: "workType",
            render: (v?: string) => (v ? <Tag>{v}</Tag> : null),
        },
        {
            title: "Đã lưu",
            dataIndex: "favoritedAt",
            render: (v: string) => dayjs(v).format("DD-MM-YYYY HH:mm"),
        },
        {
            title: "",
            key: "actions",
            width: 50,
            align: "right",
            render: (_t, record) => (
                <Popconfirm
                    title="Bỏ yêu thích công việc này?"
                    okText="Bỏ thích"
                    cancelText="Hủy"
                    onConfirm={() => handleUnfavorite(record.jobId)}
                >
                    <HeartFilled style={{ color: "red", fontSize: 18, cursor: "pointer" }} />
                </Popconfirm>
            ),
        },
    ];

    return (
        <Table<IFavoriteItem>
            rowKey={(r) => r.jobId}
            columns={columns}
            dataSource={data}
            loading={loading}
            pagination={{
                current: page,
                pageSize,
                total,
                showSizeChanger: true,
                onChange: (p, s) => {
                    setPage(p);
                    setPageSize(s);
                    fetchData(p, s);
                },
            }}
        />
    );
};


const JobByEmail = (props: any) => {
    const [form] = Form.useForm();
    const user = useAppSelector(state => state.account.user);
    const [optionsSkills, setOptionsSkills] = useState<{
        label: string;
        value: string;
    }[]>([]);

    const [subscriber, setSubscriber] = useState<ISubscribers | null>(null);

    useEffect(() => {
        const init = async () => {
            await fetchSkill();
            const res = await callGetSubscriberSkills();
            if (res && res.data) {
                setSubscriber(res.data);
                const d = res.data.skills;
                const arr = d.map((item: any) => {
                    return {
                        label: item.name as string,
                        value: item.id + "" as string
                    }
                });
                form.setFieldValue("skills", arr);
            }
        }
        init();
    }, [])

    const fetchSkill = async () => {
        let query = `page=1&size=100&sort=createdAt,desc`;

        const res = await callFetchAllSkill(query);
        if (res && res.data) {
            const arr = res?.data?.result?.map(item => {
                return {
                    label: item.name as string,
                    value: item.id + "" as string
                }
            }) ?? [];
            setOptionsSkills(arr);
        }
    }

    const onFinish = async (values: any) => {
        const { skills } = values;

        const arr = skills?.map((item: any) => {
            if (item?.id) return { id: item.id };
            return { id: item }
        });

        if (!subscriber?.id) {
            //create subscriber
            const data = {
                email: user.email,
                name: user.name,
                skills: arr
            }

            const res = await callCreateSubscriber(data);
            if (res.data) {
                message.success("Cập nhật thông tin thành công");
                setSubscriber(res.data);
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }


        } else {
            //update subscriber
            const res = await callUpdateSubscriber({
                id: subscriber?.id,
                skills: arr
            });
            if (res.data) {
                message.success("Cập nhật thông tin thành công");
                setSubscriber(res.data);
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }


    }

    return (
        <>
            <Form
                onFinish={onFinish}
                form={form}
            >
                <Row gutter={[20, 20]}>
                    <Col span={24}>
                        <Form.Item
                            label={"Kỹ năng"}
                            name={"skills"}
                            rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 skill!' }]}

                        >
                            <Select
                                mode="multiple"
                                allowClear
                                suffixIcon={null}
                                style={{ width: '100%' }}
                                placeholder={
                                    <>
                                        <MonitorOutlined /> Tìm theo kỹ năng...
                                    </>
                                }
                                optionLabelProp="label"
                                options={optionsSkills}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Button onClick={() => form.submit()}>Cập nhật</Button>
                    </Col>
                </Row>
            </Form>
        </>
    )
}

const ManageAccount = (props: IProps) => {
    const { open, onClose } = props;
    const [dataInit, setDataInit] = useState<IUser | null>(null);
    const dispatch = useAppDispatch();

    const tableRef = useRef<ActionType>();

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const onChange = (key: string) => {
        // console.log(key);
    };

    const accountUser = useAppSelector((state) => state.account.user);
    const userDetail = useAppSelector((state) => state.userDetail.user);

    useEffect(() => {
        if (open && accountUser.id) {
            dispatch(fetchUserById(accountUser.id));
        }
    }, [open, accountUser.id, dispatch]);

    useEffect(() => {
        if (open && userDetail) {
            setDataInit(userDetail as IUser);
        }
    }, [open, userDetail]);

    const items: TabsProps['items'] = [
        {
            key: 'user-resume',
            label: `Rải CV`,
            children: <UserResume />,
        },
        {
            key: 'email-by-skills',
            label: `Nhận Jobs qua Email`,
            children: <JobByEmail />,
        },
        {
            key: 'user-update-info',
            label: `Cập nhật thông tin`,
            children: <UserUpdateInfo
                dataInit={dataInit}
                setDataInit={setDataInit}
                open={open}
                onClose={onClose}
            />,
        },
        {
            key: 'user-password',
            label: `Thay đổi mật khẩu`,
            children: <UserChangePassword
                open={open}
                onClose={onClose}
            />,
        },
        {
            key: 'user-favorites',
            label: `Việc đã yêu thích`,
            children: <UserFavoriteJobs />,
        },
    ];


    return (
        <>
            <Modal
                title="Quản lý tài khoản"
                open={open}
                onCancel={() => onClose(false)}
                maskClosable={false}
                footer={null}
                destroyOnClose={true}
                width={isMobile ? "100%" : "1000px"}
            >

                <div style={{ minHeight: 400 }}>
                    <Tabs
                        defaultActiveKey="user-resume"
                        items={items}
                        onChange={onChange}
                    />
                </div>

            </Modal>
        </>
    )
}

export default ManageAccount;