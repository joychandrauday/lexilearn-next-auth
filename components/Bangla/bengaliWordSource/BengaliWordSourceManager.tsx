'use client';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, message, Popconfirm, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import WordByLanguageModal from './WordByLanguageModal';
import { toast } from 'sonner';

const WordSourceManager = () => {
    const [data, setData] = useState<any[]>([]);
    const [options, setOptions] = useState<{ languages: string[]; exams: string[] }>({ languages: [], exams: [] });
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');
    const [sourceFilter, setSourceFilter] = useState<string | null>(null);
    const [examFilters, setExamFilters] = useState<string[]>([]);
    const [sorter, setSorter] = useState<{ field?: string; order?: 'ascend' | 'descend' }>({});
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [form] = Form.useForm();
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<string>();
    const examOptions = [
        { value: "primary", label: "PRIMARY" },
        { value: "bcs", label: "BCS" },
        { value: "bank", label: "BANK" },
        { value: "ntrca", label: "NTRCA" },
        { value: "others", label: "OTHERS" },
    ];

    // Fetch options for dynamic filters and selects
    const fetchOptions = async () => {
        try {
            const res = await fetch('/api/wordsource?getOptions=true');
            const json = await res.json();
            setOptions(json);
        } catch (error) {
            toast.error('Failed to load options');
        }
    };

    // Fetch words with server-side params
    const fetchWords = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchText) params.append('search', searchText);
        if (sourceFilter) params.append('sourceLanguage', sourceFilter);
        if (examFilters.length) params.append('exams', examFilters.join(','));
        if (sorter.field) {
            params.append('sortField', sorter.field);
            params.append('sortDir', sorter.order === 'ascend' ? '1' : '-1');
        }
        params.append('page', pagination.current.toString());
        params.append('limit', pagination.pageSize.toString());

        try {
            const res = await fetch(`/api/wordsource?${params.toString()}`);
            const { words, total } = await res.json();
            setData(words);
            setPagination({ ...pagination, total });
        } catch (error) {
            toast.error('Failed to load words');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOptions();
        fetchWords();
    }, [searchText, sourceFilter, examFilters, sorter, pagination.current, pagination.pageSize]);

    // Debounced search input
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => setSearchText(e.target.value), 500);
    };

    // Create or update word
    const handleSave = async (values: any) => {
        setSubmitLoading(true);
        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `/api/wordsource/${editingId}` : '/api/wordsource';
        const payload = {
            ...values,
            sourceLanguage: Array.isArray(values.sourceLanguage)
                ? values.sourceLanguage[0]
                : values.sourceLanguage,
            userEmail: session?.user?.email,
        };
        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success(`Word ${editingId ? 'updated' : 'added'} successfully`);
                setIsModalOpen(false);
                form.resetFields();
                fetchWords();
                fetchOptions(); // Refresh options after add/update
            } else {
                const errorData = await res.json();
                console.log(errorData);
                toast.error(errorData.error || 'Operation failed');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setSubmitLoading(false);
        }
    };

    // Delete word
    const deleteWord = async (id: string) => {
        try {
            const res = await fetch(`/api/wordsource/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Word deleted successfully');
                fetchWords();
                fetchOptions(); // Refresh options after delete
            } else {
                toast.error('Failed to delete the word');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    // Table columns
    const columns = [
        {
            title: 'বাংলা শব্দ',
            dataIndex: 'banglaWord',
            key: 'banglaWord',
            sorter: true,
            render: (text: string) => <b style={{ fontSize: '1.1rem' }} className='font-hind'>{text}</b>,
        },
        {
            title: 'কোন দেশি',
            dataIndex: 'sourceLanguage',
            key: 'sourceLanguage',
            sorter: true,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, visible }: any) => {
                useEffect(() => {
                    if (visible) {
                        setSelectedKeys(sourceFilter ? [sourceFilter] : []);
                    }
                }, [visible]);

                return (
                    <div style={{ padding: 8 }} className='font-hind'>
                        <Select
                            style={{ width: 188, marginBottom: 8, display: 'block' }}
                            value={selectedKeys[0]}
                            onChange={(value) => setSelectedKeys(value ? [value] : [])}
                            options={options.languages.map((lang) => ({ value: lang, label: lang }))}
                            allowClear
                            placeholder="Select source"
                            showSearch
                        />
                        <Space>
                            <Button
                                type="primary"
                                onClick={() => {
                                    setSourceFilter(selectedKeys[0] || null);
                                    confirm();
                                }}
                                size="small"
                                style={{ width: 90 }}
                            >
                                Filter
                            </Button>
                            <Button
                                onClick={() => {
                                    clearFilters();
                                    setSourceFilter(null);
                                }}
                                size="small"
                                style={{ width: 90 }}
                            >
                                Reset
                            </Button>
                        </Space>
                    </div>
                );
            },
            filteredValue: sourceFilter ? [sourceFilter] : null,
            render: (lang: string) => (
                <Tag
                    className='cursor-pointer font-hind'
                    onClick={() => {
                        setSelectedLanguage(lang);
                        setOpen(true);
                    }}
                    color={lang === 'others' ? 'default' : 'geekblue'}>{lang}</Tag>
            ),
        },
        {
            title: 'Exams',
            dataIndex: 'exam',
            key: 'exam',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, visible }: any) => {
                useEffect(() => {
                    if (visible) {
                        setSelectedKeys(examFilters || []);
                    }
                }, [visible]);

                return (
                    <div style={{ padding: 8 }}>
                        <Select
                            mode="multiple"
                            style={{ width: 188, marginBottom: 8, display: 'block' }}
                            value={selectedKeys}
                            onChange={setSelectedKeys}
                            options={options.exams.map((ex) => ({ value: ex, label: ex.toUpperCase() }))}
                            placeholder="Select exams"
                        />
                        <Space>
                            <Button
                                type="primary"
                                onClick={() => {
                                    setExamFilters(selectedKeys || []);
                                    confirm();
                                }}
                                size="small"
                                style={{ width: 90 }}
                            >
                                Filter
                            </Button>
                            <Button
                                onClick={() => {
                                    clearFilters();
                                    setExamFilters([]);
                                }}
                                size="small"
                                style={{ width: 90 }}
                            >
                                Reset
                            </Button>
                        </Space>
                    </div>
                );
            },
            filteredValue: examFilters,
            render: (exams: string[]) => (
                <>
                    {exams?.map((e) => (
                        <Tag color="green" key={e} style={{ marginBottom: '2px' }}>
                            {e.toUpperCase()}
                        </Tag>
                    ))}
                </>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            width: 120,
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<EditOutlined style={{ color: '#1890ff' }} />}
                        onClick={() => {
                            setEditingId(record._id);
                            form.setFieldsValue(record);
                            setIsModalOpen(true);
                        }}
                        disabled={session?.user?.email !== record.userEmail}
                    />
                    <Popconfirm title="Delete this word?" onConfirm={() => deleteWord(record._id)}>
                        <Button type="text" danger icon={<DeleteOutlined disabled={session?.user?.email !== record.userEmail} />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }} className="font-hind">
            {/* Header and Search Section */}
            <Card style={{ marginBottom: 24 }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px',
                    }}
                >
                    <h2 style={{ margin: 0 }} className='text-xl font-bold font-hind'>কোন দেশি শব্দ...</h2>
                    <Space size="middle">
                        <Input
                            placeholder="Search words, modules..."
                            prefix={<SearchOutlined />}
                            allowClear
                            onChange={handleSearchChange}
                            style={{ width: 300 }}
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setEditingId(null);
                                form.resetFields();
                                setIsModalOpen(true);
                            }}
                            className='font-hind font-bold'
                            disabled={!session?.user?.email}
                        >
                            শব্দ যোগ করুন
                        </Button>
                    </Space>
                </div>
            </Card>

            {/* Table Section */}
            <Table
                dataSource={data}
                columns={columns}
                rowKey="_id"
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`,
                }}
                onChange={(page, _, sor) => {
                    setPagination(page as any);
                    setSorter(sor as any);
                }}
                bordered
            />
            <WordByLanguageModal
                open={open}
                sourceLanguage={selectedLanguage}
                onClose={() => setOpen(false)}
            />
            {/* Create/Edit Modal */}
            <Modal
                title={editingId ? 'Update Word Details' : 'Create New Word Entry'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={submitLoading}
                onOk={() => form.submit()}
                okText={editingId ? 'Update' : 'Create'}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    initialValues={{ sourceLanguage: ['others'], exam: ['others'] }}
                >
                    <Form.Item
                        name="banglaWord"
                        label="Bangla Word"
                        rules={[{ required: true, message: 'Please enter the Bangla word' }]}
                    >
                        <Input placeholder="শব্দটি লিখুন (যেমন: বালতি)" />
                    </Form.Item>
                    <Form.Item name="sourceLanguage" label="Source Language">
                        <Select
                            mode="tags"
                            maxCount={1}
                            showSearch
                            options={options.languages.map((lang) => ({ value: lang, label: lang }))}
                            placeholder="Select or type new source language"
                        />
                    </Form.Item>
                    <Form.Item name="exam" label="Target Exams">
                        <Select
                            mode="tags"
                            options={examOptions}
                            placeholder="Select or add exams"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default WordSourceManager;