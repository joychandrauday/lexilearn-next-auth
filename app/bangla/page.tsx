"use client";

import React from "react";
import { Typography, Card, Row, Col } from "antd";
import {
    BookOutlined,
    EditOutlined,
    ReadOutlined,
    ProfileOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Title, Paragraph } = Typography;

const services = [
    {
        title: "শব্দ",
        description: "শব্দের অর্থ, প্রকারভেদ ও ব্যবহার শিখুন",
        icon: <BookOutlined style={{ fontSize: 32 }} />,
        path: "/bangla/shobdo",
    },
    {
        title: "কারক",
        description: "কারকের সংজ্ঞা ও উদাহরণসহ বিস্তারিত আলোচনা",
        icon: <EditOutlined style={{ fontSize: 32 }} />,
        path: "/bangla/karok",
    },
    {
        title: "বাগধারা",
        description: "বাংলা বাগধারা ও অর্থ ব্যাখ্যা",
        icon: <ReadOutlined style={{ fontSize: 32 }} />,
        path: "/bangla/baghdhara",
    },
    {
        title: "সমার্থক শব্দ",
        description: "সমার্থক শব্দ ও ব্যবহারিক প্রয়োগ",
        icon: <ProfileOutlined style={{ fontSize: 32 }} />,
        path: "/bangla/somarthok",
    },
];

const Page: React.FC = () => {
    const router = useRouter();

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(180deg, #ffffff, #f0f2f5)",
                padding: "64px 24px",
            }}
        >
            {/* Header Section */}
            <div style={{ textAlign: "center", marginBottom: 56 }}>
                <Title level={1} style={{ marginBottom: 8 }}>
                    বাংলা শিক্ষা মডিউল
                </Title>
                <Paragraph style={{ fontSize: 17, color: "#595959" }}>
                    বাংলা ভাষা ও ব্যাকরণ শেখার জন্য প্রয়োজনীয় সকল বিষয় এক জায়গায়
                </Paragraph>
            </div>

            {/* Services Grid */}
            <Row gutter={[24, 24]} justify="center">
                {services.map((service) => (
                    <Col key={service.title} xs={24} sm={12} md={8} lg={6}>
                        <Card
                            hoverable
                            onClick={() => router.push(service.path)}
                            style={{
                                height: "100%",
                                borderRadius: 14,
                                textAlign: "center",
                            }}
                            styles={{
                                body: { padding: 32 },
                            }}
                        >
                            <div
                                style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: "50%",
                                    background: "#f5f7fa",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 16px",
                                    color: "#1677ff",
                                }}
                            >
                                {service.icon}
                            </div>

                            <Title level={4} style={{ marginBottom: 8 }}>
                                {service.title}
                            </Title>

                            <Paragraph style={{ color: "#595959", fontSize: 15 }}>
                                {service.description}
                            </Paragraph>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default Page;
