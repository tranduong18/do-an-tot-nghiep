import ModalBlog from "@/components/admin/blog/modal.blog";
import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchBlog } from "@/redux/slice/blogSlide";
import { IBlog } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from "@ant-design/pro-components";
import { Button, Popconfirm, Space, Tag, message, notification } from "antd";
import { useRef, useState } from "react";
import dayjs from "dayjs";
import { callBlogDelete } from "@/config/api";
import queryString from "query-string";
import { sfLike } from "spring-filter-query-builder";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import PageHelmet from "@/components/share/page.helmet";

const BlogPage = () => {
    const [openModal, setOpenModal] = useState(false);
    const [dataInit, setDataInit] = useState<IBlog | null>(null);

    const tableRef = useRef<ActionType>();

    const isFetching = useAppSelector((s) => s.blog.isFetching);
    const meta = useAppSelector((s) => s.blog.meta);
    const blogs = useAppSelector((s) => s.blog.result);
    const dispatch = useAppDispatch();

    const reloadTable = () => tableRef.current?.reload();

    const handleDelete = async (id?: number) => {
        if (!id) return;
        const res = await callBlogDelete(id);
        if (res && +res.statusCode === 200) {
            message.success("Xóa blog thành công");
            reloadTable();
        } else {
            notification.error({ message: "Có lỗi xảy ra", description: res?.message });
        }
    };

    const columns: ProColumns<IBlog>[] = [
        {
            title: "STT",
            key: "index",
            width: 60,
            align: "center",
            render: (_t, _r, i) => <>{i + 1 + (meta.page - 1) * meta.pageSize}</>,
            hideInSearch: true,
        },
        { title: "Tiêu đề", dataIndex: "title", sorter: true },
        {
            title: "Công ty",
            dataIndex: ["company", "name"],
            render: (_: any, r) => r.company?.name ?? <Tag>System</Tag>,
            hideInSearch: true,
        },
        {
            title: "Trạng thái",
            dataIndex: "published",
            render: (v) => (v ? <Tag color="green">Published</Tag> : <Tag color="orange">Draft</Tag>),
            hideInSearch: true,
        },
        {
            title: "CreatedAt",
            dataIndex: "createdAt",
            width: 200,
            sorter: true,
            render: (_text, record) => (
                <>{record.createdAt ? dayjs(record.createdAt).format("DD-MM-YYYY HH:mm:ss") : ""}</>
            ),
            hideInSearch: true,
        },
        {
            title: "UpdatedAt",
            dataIndex: "updatedAt",
            width: 200,
            sorter: true,
            render: (_t, r) => <>{r.updatedAt ? dayjs(r.updatedAt).format("DD-MM-YYYY HH:mm:ss") : ""}</>,
            hideInSearch: true,
        },
        {
            title: "Actions",
            width: 80,
            hideInSearch: true,
            render: (_v, entity) => (
                <Space>
                    <Access permission={ALL_PERMISSIONS.BLOGS.UPDATE} hideChildren>
                        <EditOutlined
                            style={{ fontSize: 18, color: "#ffa500" }}
                            onClick={() => {
                                setOpenModal(true);
                                setDataInit(entity);
                            }}
                        />
                    </Access>
                    <Access permission={ALL_PERMISSIONS.BLOGS.DELETE} hideChildren>
                        <Popconfirm
                            placement="leftTop"
                            title="Xác nhận xóa blog"
                            description="Bạn có chắc chắn muốn xóa blog này?"
                            onConfirm={() => handleDelete(entity.id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                        >
                            <span style={{ cursor: "pointer", marginLeft: 8 }}>
                                <DeleteOutlined style={{ fontSize: 18, color: "#ff4d4f" }} />
                            </span>
                        </Popconfirm>
                    </Access>
                </Space>
            ),
        },
    ];

    const buildQuery = (params: any, sort: any) => {
        const q: any = { page: params.current, size: params.pageSize };
        // search theo tiêu đề
        if (params.title) q.filter = sfLike("title", params.title);

        let temp = queryString.stringify(q);
        let sortBy = "";

        if (sort?.title) sortBy = sort.title === "ascend" ? "sort=title,asc" : "sort=title,desc";
        if (sort?.createdAt) sortBy = sort.createdAt === "ascend" ? "sort=createdAt,asc" : "sort=createdAt,desc";
        if (sort?.updatedAt) sortBy = sort.updatedAt === "ascend" ? "sort=updatedAt,asc" : "sort=updatedAt,desc";

        temp = sortBy ? `${temp}&${sortBy}` : `${temp}&sort=updatedAt,desc`;
        return temp;
    };

    return (
        <div>
            <PageHelmet title="Quản lý blog" />
            <Access permission={ALL_PERMISSIONS.BLOGS.GET_PAGINATE}>
                <DataTable<IBlog>
                    actionRef={tableRef}
                    headerTitle="Danh sách Blog"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={blogs}
                    request={async (params, sort): Promise<any> => {
                        const query = buildQuery(params, sort);
                        dispatch(fetchBlog({ query, adminView: true }));
                    }}
                    scroll={{ x: true }}
                    pagination={{
                        current: meta.page,
                        pageSize: meta.pageSize,
                        showSizeChanger: true,
                        total: meta.total,
                        showTotal: (total, range) => (
                            <div>
                                {range[0]}-{range[1]} trên {total} rows
                            </div>
                        ),
                    }}
                    rowSelection={false}
                    toolBarRender={(): any => (
                        <Access permission={ALL_PERMISSIONS.BLOGS.CREATE} hideChildren>
                            <Button icon={<PlusOutlined />} type="primary" onClick={() => setOpenModal(true)}>
                                Thêm mới
                            </Button>
                        </Access>
                    )}
                />
            </Access>

            <ModalBlog
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div>
    );
};

export default BlogPage;
