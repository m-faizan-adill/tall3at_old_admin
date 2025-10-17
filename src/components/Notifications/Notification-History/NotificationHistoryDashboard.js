import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHistory,
    faSearch,

} from "@fortawesome/free-solid-svg-icons";
import "./NotificationHistoryDashboard.css";
import { API_CONFIG } from "../../../constants/config";
import CustomTable from "../../common/CustomTable";

// Dummy data generator
const generateDummyData = (type, count = 25) => {
    const arr = [];
    for (let i = 1; i <= count; i++) {
        arr.push({
            id: `${type}-${i}`,
            recipientName: `${type} ${i}`,
            recipientEmail: `${type.toLowerCase()}${i}@example.com`,
            recipientPhone: `+92300123${100 + i}`,
            title: `Test Notification ${i}`,
            body: `This is a dummy message body for ${type} notification ${i}.`,
            status: i % 7 === 0 ? "Failed" : "Sent",
            createdAt: new Date(Date.now() - i * 1000 * 60 * 60).toISOString(),
        });
    }
    return arr;
};

const TabKey = {
    CUSTOMERS: "customers",
    PROVIDERS: "providers",
    ADMINS: "admin"
};

const NotificationHistoryDashboard = () => {
    const [activeTab, setActiveTab] = useState(TabKey.CUSTOMERS);
    const [customers, setCustomers] = useState([]);
    const [providers, setProviders] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Edit state
    const [editing] = useState(null); // notification id
    const [editTitle, setEditTitle] = useState("");
    const [editBody, setEditBody] = useState("");

    const [admins, setAdmins] = useState([]);


    // Load dummy data
    useEffect(() => {
        const dummyCustomers = generateDummyData("Customer", 25);
        const dummyProviders = generateDummyData("Provider", 25);
        // const dummyAdmin = generateDummyData("admin",25)
        setCustomers(dummyCustomers);
        setProviders(dummyProviders);
    }, []);


    //api yahan hit hogi
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(`${API_CONFIG.BASE_URL}/api/admin/notification-history`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });


                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                console.log(data)

                const customers = data.filter(n => n.role?.toLowerCase() === "customer");
                const providers = data.filter(n => n.role?.toLowerCase() === "provider");
                const admins = data.filter(n => n.role?.toLowerCase() === "admin");

                console.log(customers, providers)

                setCustomers(customers);
                setProviders(providers);
                setAdmins(admins);

            } catch (err) {
                console.error("Failed to fetch history:", err);
            }
        };

        fetchHistory();
    }, []);


    // Select list by tab
    const list = activeTab === TabKey.CUSTOMERS
        ? customers
        : activeTab === TabKey.PROVIDERS
            ? providers
            : admins;

    // Apply search
    const filtered = list.filter((h) =>
        `${h.title} ${h.body} ${h.fullName} ${h.email} ${h.userName}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    // Paginate
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    const columns = [
        { key: "fullName", label: "Recipient" },
        { key: "email", label: "Email" },
        { key: "userName", label: "Phone" },
        { key: "title", label: "Title" },
        { key: "body", label: "Message" },
        {
            key: "status",
            label: "Status",
            render: (v) => (
                <span className={v === "Failed" ? "status-failed" : "status-sent"}>
                    {v}
                </span>
            ),
        },
        {
            key: "createdAt",
            label: "Date",
            render: (v) => new Date(v).toLocaleString(),
        },
    ];


    return (
        <div className="notifications-list">
            {/* Header */}
            <div className="notif-history-header">
                <FontAwesomeIcon icon={faHistory} />
                <h1>Notification History</h1>
            </div>

            {/* Tabs */}
            <div className="notif-history-tabs">
                <button
                    className={activeTab === TabKey.CUSTOMERS ? "active" : ""}
                    onClick={() => {
                        setActiveTab(TabKey.CUSTOMERS);
                        setPage(1);
                    }}
                >
                    Customers
                </button>
                <button
                    className={activeTab === TabKey.PROVIDERS ? "active" : ""}
                    onClick={() => {
                        setActiveTab(TabKey.PROVIDERS);
                        setPage(1);
                    }}
                >
                    Providers
                </button>
                <button
                    className={activeTab === TabKey.ADMINS ? "active" : ""}
                    onClick={() => { setActiveTab(TabKey.ADMINS); setPage(1); }}
                >
                    Admin
                </button>
            </div>

            {/* Search */}
            <div className="notif-history-controls">
                <div className="search">
                    <FontAwesomeIcon icon={faSearch} />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab} by name, phone, title...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>
            <CustomTable
                columns={columns}
                data={paginated}
                loading={false}
                pagination={{
                    currentPage: page,
                    totalPages: Math.ceil(filtered.length / pageSize),
                    onPageChange: (newPage) => setPage(newPage),
                }}
                noDataMessage="No notifications found."
            />
        </div>
    );
};

export default NotificationHistoryDashboard;
