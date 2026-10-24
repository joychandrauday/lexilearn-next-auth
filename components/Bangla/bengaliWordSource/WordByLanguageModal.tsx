'use client';

import { Modal, Table, Tag, Spin, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';

interface WordItem {
    _id: string;
    banglaWord: string;
    sourceLanguage: string;
    exam: string[];
    userEmail: string;
    createdAt: string;
}

interface Props {
    open: boolean;
    sourceLanguage?: string;
    onClose: () => void;
}

const WordByLanguageModal: React.FC<Props> = ({
    open,
    sourceLanguage,
    onClose,
}) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<WordItem[]>([]);

    useEffect(() => {
        if (!open || !sourceLanguage) return;

        const fetchWords = async () => {
            setLoading(true);
            try {
                console.log(sourceLanguage);
                const res = await fetch(
                    `/api/wordsource/language/${encodeURIComponent(
                        sourceLanguage
                    )}`
                );
                const json = await res.json();
                setData(json.words || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchWords();
    }, [open, sourceLanguage]);

    const columns: ColumnsType<WordItem> = [
        {
            title: 'Bangla Word',
            dataIndex: 'banglaWord',
            key: 'banglaWord',
        },
        {
            title: 'Exam',
            dataIndex: 'exam',
            key: 'exam',
            render: (exams: string[]) =>
                exams?.map((e) => (
                    <Tag key={e} color="blue">
                        {e.toUpperCase()}
                    </Tag>
                )),
        },
        {
            title: 'Added By',
            dataIndex: 'userEmail',
            key: 'userEmail',
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString(),
        },
    ];

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={900}
            title={`Words from "${sourceLanguage}"`}
            destroyOnClose
        >
            {loading ? (
                <Spin fullscreen={false} />
            ) : data.length === 0 ? (
                <Empty description="No words found" />
            ) : (
                <Table
                    rowKey="_id"
                    columns={columns}
                    dataSource={data}
                    pagination={{ pageSize: 10 }}
                />
            )}
        </Modal>
    );
};

export default WordByLanguageModal;
