'use client';

import { Volume2, Plus } from "lucide-react";
import React, { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Table, Tag, Spin, message, Input, Select, Tooltip, Modal,
    Typography, Divider, Row, Col, Button, Form, AutoComplete,
    Drawer
} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { IWord } from '../../lib/models/Word';
import { useSession } from "next-auth/react";
import { ImCross } from "react-icons/im";

const { Search } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const Words: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // URL sync
    const urlSearch = searchParams.get('search') || '';
    const urlIntensity = searchParams.get('intensity') || undefined;
    const urlExam = searchParams.get('exam') || undefined;
    const urlPage = parseInt(searchParams.get('page') || '1', 10);

    const [words, setWords] = useState<IWord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState(urlSearch);
    const [intensityFilter, setIntensityFilter] = useState<string | undefined>(urlIntensity);
    const [examFilter, setExamFilter] = useState<string | undefined>(urlExam);
    const [currentPage, setCurrentPage] = useState(urlPage);
    const [selectedWord, setSelectedWord] = useState<IWord | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const [drawerOpen, setDrawerOpen] = useState(false);
    // Add Word Modal
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [adding, setAdding] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [fetchingSuggestions, setFetchingSuggestions] = useState(false);
    const [form] = Form.useForm();

    // Delete Modal
    const [modal, modalHolder] = Modal.useModal();
    const { data: session } = useSession();

    // Scroll behavior: Hide header on scroll down, show on scroll up
    const [hideHeader, setHideHeader] = useState(false);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY.current && currentScrollY > 120) {
                setHideHeader(true);     // Scrolling down → hide
            } else if (currentScrollY < lastScrollY.current) {
                setHideHeader(false);    // Scrolling up → show
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Sync state → URL
    const updateUrl = () => {
        const params = new URLSearchParams();
        if (searchText) params.set('search', searchText);
        if (intensityFilter) params.set('intensity', intensityFilter);
        if (examFilter) params.set('exam', examFilter);
        if (currentPage > 1) params.set('page', currentPage.toString());

        const query = params.toString();
        router.replace(`/words${query ? `?${query}` : ''}`, { scroll: false });
    };

    useEffect(() => {
        updateUrl();
    }, [searchText, intensityFilter, examFilter, currentPage]);

    useEffect(() => {
        if (session?.user?.email) {
            fetchWords();
        }
    }, [session]);

    const fetchWords = async () => {
        if (!session?.user?.email) return;
        setLoading(true);
        try {
            const response = await axios.get('/api/words');
            const data = Array.isArray(response.data.data) ? response.data.data : [];
            setWords(data);

        } catch (error) {
            console.error(error);
            message.error('Failed to fetch words');
        } finally {
            setLoading(false);
        }
    };

    // Autocomplete suggestions
    const fetchSuggestions = async (value: string) => {
        if (!value.trim()) {
            setSuggestions([]);
            return;
        }
        setFetchingSuggestions(true);
        try {
            const res = await axios.get(`https://api.datamuse.com/sug?s=${encodeURIComponent(value)}&max=10`);
            const filtered = res.data
                .map((item: any) => item.word)
                .filter((word: string) => !word.includes(' ') && word.length > 2);
            setSuggestions(filtered);
        } catch (err) {
            console.error('Failed to fetch suggestions', err);
        } finally {
            setFetchingSuggestions(false);
        }
    };

    const handleAddWord = async (values: { word: string; intensity: string, exam: string }) => {
        if (!session?.user?.email) {
            message.warning('Please sign in to add words');
            return;
        }

        setAdding(true);
        try {
            const res = await axios.post('/api/words', {
                word: values.word.trim(),
                intensity: values.intensity,
                exam: values.exam,
                userEmail: session.user.email,
            });

            if (res.data.success) {
                message.success(`${values.word} added successfully!`);
                form.resetFields();
                setSuggestions([]);
                setAddModalVisible(false);
                fetchWords();
                setCurrentPage(1);
            } else {
                message.error(res.data.message || 'Failed to add word');
            }
        } catch (err: any) {
            message.error(err.response?.data?.message || 'Error saving word');
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteWord = async (wordId: string) => {
        if (!session?.user?.email || !wordId) return;

        modal.confirm({
            title: 'শব্দটি মুছে ফেলতে চান?',
            content: 'এই কাজটি বাতিল করা যাবে না।',
            okText: 'হ্যাঁ, মুছুন',
            okType: 'danger',
            cancelText: 'বাতিল',
            centered: true,
            maskClosable: true,
            onOk: async () => {
                try {
                    const res = await axios.delete('/api/words', {
                        data: { wordId, userEmail: session.user.email },
                    });

                    if (res.data.success) {
                        message.success('শব্দটি মুছে ফেলা হয়েছে');
                        fetchWords();
                        if (filteredWords.length <= 1 && currentPage > 1) {
                            setCurrentPage(prev => prev - 1);
                        }
                    } else {
                        message.error(res.data.message || 'শব্দ মুছতে ব্যর্থ হয়েছে');
                    }
                } catch (err: any) {
                    message.error(err.response?.data?.message || 'শব্দ মুছতে ত্রুটি হয়েছে');
                }
            },
        });
    };

    const highlightText = (text: string, highlight: string) => {
        if (!highlight.trim()) return <>{text}</>;
        const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);
        return (
            <span>
                {parts.map((part, i) =>
                    regex.test(part) ? (
                        <Text mark key={i} style={{ backgroundColor: '#ffc069', padding: '0 2px', fontSize: '16px' }}>
                            {part}
                        </Text>
                    ) : (
                        <span key={i}>{part}</span>
                    )
                )}
            </span>
        );
    };

    const filteredWords = useMemo(() => {
        return words.filter((word) => {
            const search = searchText.toLowerCase();
            const matchesSearch =
                word.word.toLowerCase().includes(search) ||
                word.meaning.toLowerCase().includes(search) ||
                (word.bangla || '').toLowerCase().includes(search);
            const matchesIntensity = !intensityFilter || word.intensity === intensityFilter;
            const matchesExam = !examFilter || word.exam === examFilter;
            return matchesSearch && matchesIntensity && matchesExam;
        });
    }, [words, searchText, intensityFilter, examFilter]);

    const renderLimitedTags = (items: string[] = [], color: string) => {
        if (items.length === 0) return <Tag color="gray">None</Tag>;
        const visible = items.slice(0, 1);
        const hidden = items.slice(1);
        return (
            <div className="flex flex-wrap gap-1">
                {visible.map((item, idx) => (
                    <Tag color={color} key={idx}>{item}</Tag>
                ))}
                {hidden.length > 0 && (
                    <Tooltip title={hidden.join(', ')}>
                        <Tag color={color} className="cursor-pointer border-dashed">
                            +{hidden.length}
                        </Tag>
                    </Tooltip>
                )}
            </div>
        );
    };


    // Keep your existing columns array here (unchanged)
    const columns = [
        {
            title: 'শব্দ (Word)',
            dataIndex: 'word',
            key: 'word',
            render: (text: string) => (
                <Text strong className="capitalize font-bold text-xl">
                    {highlightText(text, searchText)}
                </Text>
            ),
            sorter: (a: IWord, b: IWord) => a.word.localeCompare(b.word),
        },
        {
            title: 'পরীক্ষা',
            dataIndex: 'exam',
            key: 'exam',
            render: (text: string) => (
                <div className="max-w-xs uppercase font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">{text}</div>
            ),
        },
        {
            title: 'ইংরেজি অর্থ',
            dataIndex: 'meaning',
            key: 'meaning',
            render: (text: string) => (
                <div className="max-w-xs">{highlightText(text, searchText)}</div>
            ),
        },
        {
            title: 'বাংলা অর্থ',
            dataIndex: 'bangla',
            key: 'bangla',
            render: (bangla: string) => (
                <div className="max-w-xs font-semibold text-emerald-800">{highlightText(bangla || '—', searchText)}</div>
            ),
        },
        {
            title: 'সমার্থক শব্দ',
            dataIndex: 'synonyms',
            key: 'synonyms',
            render: (synonyms: string[]) => renderLimitedTags(synonyms, 'green'),
        },
        {
            title: 'বিপরীত শব্দ',
            dataIndex: 'antonyms',
            key: 'antonyms',
            render: (antonyms: string[]) => renderLimitedTags(antonyms, 'red'),
        },
        {
            title: 'পদ',
            dataIndex: 'partOfSpeech',
            key: 'partOfSpeech',
            render: (pos: string) => <Tag color="blue">{pos || '—'}</Tag>,
        },
        {
            title: 'তীব্রতা',
            dataIndex: 'intensity',
            key: 'intensity',
            render: (intensity: string) => {
                const color = intensity === 'high' ? 'volcano' : intensity === 'medium' ? 'orange' : 'green';
                const label = intensity === 'high' ? 'উচ্চ' : intensity === 'medium' ? 'মাঝারি' : 'সহজ';
                return <Tag color={color}>{label}</Tag>;
            },
            filters: [
                { text: 'সহজ', value: 'low' },
                { text: 'মাঝারি', value: 'medium' },
                { text: 'উচ্চ', value: 'high' },
            ],
            onFilter: (value: any, record: IWord) => record.intensity === value,
        },
        {
            title: 'অ্যাকশন',
            key: 'action',
            width: 100,
            render: (_: any, record: IWord) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteWord(record._id!.toString());
                        }}
                        className="text-red-600 hover:bg-red-50 rounded"
                        disabled={session?.user?.email !== record.userEmail}
                    >
                        মুছুন
                    </Button>
                </div>
            ),
        },
    ];

    const handleRowClick = (record: IWord) => {
        setSelectedWord(record);
        setDrawerOpen(true); // Open drawer instead of modal
    };

    const banglaMeanings = selectedWord?.bangla?.split(',').map(s => s.trim()).filter(Boolean) || [];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sticky Header that hides on scroll down */}
            <div className={`sticky top-0 z-50 bg-gray-50 transition-all duration-500 ease-in-out ${hideHeader ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
                }`}>
                {/* Title */}
                <div className="px-6 py-5 border-b bg-gray-50 backdrop-blur">
                    <Title level={2} className="m-0 !font-black">ভোকাবুলারি কোষ ও অনুশীলন</Title>
                </div>

                {/* Search & Filters */}
                <div className="px-6 py-6 bg-white border-b">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex flex-col md:flex-row gap-4 flex-1">
                            <Search
                                placeholder="শব্দ, ইংরেজি অর্থ বা বাংলায় খুঁজুন..."
                                allowClear
                                enterButton="অনুসন্ধান"
                                size="large"
                                value={searchText}
                                onSearch={(value) => {
                                    setSearchText(value);
                                    setCurrentPage(1);
                                }}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="md:w-96"
                            />
                            <Select
                                placeholder="তীব্রতা অনুযায়ী ফিল্টার"
                                allowClear
                                size="large"
                                value={intensityFilter}
                                onChange={(value) => {
                                    setIntensityFilter(value as string | undefined);
                                    setCurrentPage(1);
                                }}
                                className="w-48"
                            >
                                <Option value="low">সহজ (Low)</Option>
                                <Option value="medium">মাঝারি (Medium)</Option>
                                <Option value="high">উচ্চ (High)</Option>
                            </Select>
                            <Select
                                placeholder="পরীক্ষা নির্বাচন করুন"
                                allowClear
                                size="large"
                                value={examFilter}
                                onChange={(value) => {
                                    setExamFilter(value as string | undefined);
                                    setCurrentPage(1);
                                }}
                                className="w-48"
                            >
                                <Option value="primary">Primary শিক্ষক</Option>
                                <Option value="bcs">বিসিএস (BCS)</Option>
                                <Option value="bank">ব্যাংক (BANK)</Option>
                                <Option value="ntrca">নিবন্ধন (NTRCA)</Option>
                                <Option value="others">অন্যান্য</Option>
                            </Select>
                        </div>

                        <Button
                            type="primary"
                            size="large"
                            icon={<Plus className="w-5 h-5" />}
                            onClick={() => setAddModalVisible(true)}
                            className="flex items-center gap-2 bg-emerald-600 hover:!bg-emerald-700 font-bold shadow-lg rounded-xl h-11"
                        >
                            নতুন শব্দ যোগ
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className=" py-8">
                {loading ? (
                    <div className="flex justify-center items-center min-h-[60vh]">
                        <Spin size="large" tip="শব্দ লোড হচ্ছে..." />
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={filteredWords}
                        rowKey={(record) => record._id?.toString() || `word-${record.word}`}
                        pagination={{
                            current: currentPage,
                            pageSize: 10,
                            total: filteredWords.length,
                            showSizeChanger: false,
                            onChange: (page) => setCurrentPage(page),
                        }}
                        bordered
                        scroll={{ x: 'max-content' }}
                        rowClassName="cursor-pointer hover:bg-gray-50 transition"
                        onRow={(record) => ({
                            onClick: (e: any) => {
                                const target = e.target as HTMLElement;
                                if (target.closest('button') || target.tagName === 'BUTTON') return;
                                handleRowClick(record);
                            },
                        })}
                    />
                )}
            </div>

            {/* Replaced Modal with Drawer (from bottom) */}
            <Drawer
                title={
                    <div className="flex items-center justify-between w-full">
                        {/* Left side: word, pronunciation, intensity */}
                        <div className="flex items-center gap-3">
                            <Title level={3} className="m-0 capitalize">{selectedWord?.word}</Title>

                            {selectedWord?.pronunciation && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        new Audio(selectedWord.pronunciation).play().catch(() => { });
                                    }}
                                    className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    <Volume2 className="w-6 h-6 text-blue-500" />
                                </button>
                            )}

                            {selectedWord?.intensity && (
                                <Tag
                                    color={
                                        selectedWord.intensity === 'high'
                                            ? 'red'
                                            : selectedWord.intensity === 'medium'
                                                ? 'orange'
                                                : 'green'
                                    }
                                >
                                    {selectedWord.intensity}
                                </Tag>
                            )}
                        </div>
                    </div>
                }
                placement="bottom"
                height="90%"
                onClose={() => setDrawerOpen(false)}
                open={drawerOpen}
                closeIcon={<ImCross className="text-xl" />} // custom close button
                maskClosable={true} // click outside to close
                className="rounded-t-3xl overflow-hidden"
                headerStyle={{
                    borderBottom: '1px solid #f0f0f0',
                    paddingRight: '24px', // spacing so close icon doesn’t overlap
                }}
                bodyStyle={{ padding: '24px' }}
            >

                {selectedWord && (
                    <div className="space-y-6 max-h-full overflow-y-auto pb-20">
                        {banglaMeanings.length > 0 && (
                            <div>
                                <Text strong className="text-lg block mb-3">Bangla Meanings:</Text>
                                <div className="space-y-3">
                                    {banglaMeanings.map((m, i) => (
                                        <div key={i} className="flex items-start gap-3 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                            <span className="font-bold text-yellow-700">{i + 1}.</span>
                                            <Text className="text-base font-medium">{m}</Text>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div>
                            <Text strong className="text-lg block mb-2">Meaning:</Text>
                            <Paragraph className="text-base bg-gray-50 p-4 rounded-lg border">
                                {selectedWord.meaning}
                            </Paragraph>
                        </div>

                        {selectedWord.example && (
                            <div className="mt-3">
                                <strong className="block mb-1 text-sm text-gray-700">Examples:</strong>
                                <ul className="bg-blue-50 p-4 rounded border-l-4 border-blue-500 text-base italic list-decimal list-inside space-y-2">
                                    {selectedWord.example
                                        .split(',')
                                        .map((ex) => ex.trim())
                                        .filter(Boolean)
                                        .map((ex, idx) => (
                                            <li key={idx} dangerouslySetInnerHTML={{ __html: ex }} className="capitalize " />
                                        ))}
                                </ul>
                            </div>
                        )}

                        <Row gutter={16}>
                            <Col span={24} md={12}>
                                <Text strong>সমার্থক শব্দ (Synonyms):</Text>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedWord.synonyms?.length > 0 ? selectedWord.synonyms.map((s, i) => (
                                        <Tag color="green" key={i}>{s}</Tag>
                                    )) : <Text type="secondary">নেই</Text>}
                                </div>
                            </Col>
                            <Col span={24} md={12}>
                                <Text strong>বিপরীত শব্দ (Antonyms):</Text>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedWord.antonyms?.length > 0 ? selectedWord.antonyms.map((a, i) => (
                                        <Tag color="red" key={i}>{a}</Tag>
                                    )) : <Text type="secondary">নেই</Text>}
                                </div>
                            </Col>
                        </Row>

                        <Divider />


                        <div className="flex justify-center items-center pt-6 border-t">
                            <Tag color="blue" className="text-lg font-semibold px-6 py-2">
                                {selectedWord.partOfSpeech || '—'}
                            </Tag>
                        </div>
                    </div>
                )}
            </Drawer>

            <Modal
                title={<Title level={3} className="m-0 !font-black">নতুন শব্দ যোগ করুন</Title>}
                open={addModalVisible}
                onCancel={() => {
                    setAddModalVisible(false);
                    form.resetFields();
                    setSuggestions([]);
                }}
                footer={null}
                width={500}
            >
                <Form form={form} layout="vertical" onFinish={handleAddWord} initialValues={{ intensity: 'medium', exam: 'others' }}>
                    <Form.Item
                        label="ইংরেজি শব্দ (Word)"
                        name="word"
                        rules={[
                            { required: true, message: 'শব্দটি লিখুন' },
                            { min: 2, message: 'শব্দ কমপক্ষে ২ অক্ষরের হতে হবে' }
                        ]}
                    >
                        <AutoComplete
                            options={suggestions.map(w => ({ value: w }))}
                            onSearch={fetchSuggestions}
                            placeholder="যেমন: tenacious, pristine..."
                            notFoundContent={fetchingSuggestions ? <Spin size="small" /> : 'পরামর্শ পাওয়া যায়নি'}
                            filterOption={false}
                        />
                    </Form.Item>

                    <Form.Item label="তীব্রতা / গুরুত্ব (Intensity)" name="intensity">
                        <Select>
                            <Option value="low">সহজ (Easy)</Option>
                            <Option value="medium">মাঝারি (Normal)</Option>
                            <Option value="high">উচ্চ / কঠিন (Hard)</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="পরীক্ষা (Target Exam)" name="exam">
                        <Select>
                            <Option value="bcs">বিসিএস (BCS)</Option>
                            <Option value="bank">ব্যাংক (BANK)</Option>
                            <Option value="primary">প্রাথমিক শিক্ষক (Primary)</Option>
                            <Option value="ntrca">নিবন্ধন (NTRCA)</Option>
                            <Option value="others">অন্যান্য</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <div className="flex justify-end gap-3">
                            <Button onClick={() => { form.resetFields(); setSuggestions([]); }}>মুছুন</Button>
                            <Button type="primary" htmlType="submit" loading={adding} icon={<Plus className="w-4 h-4" />} className="bg-emerald-600 hover:!bg-emerald-700 font-bold">
                                সংরক্ষণ করুন
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>

            {modalHolder}
        </div >
    );
};


export default Words;