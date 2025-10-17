import React, { useState, useEffect } from "react";
import "./Transactions.css";
import api from "../../services/api";
import CustomTable from "../common/CustomTable";

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🔹 Filters
    const [filters, setFilters] = useState({
        customerName: "",
        providerName: "",
        tripTitle: "",
        bookingDate: "",
    });

    const fetchTransactions = async (page = 1, pageSize = 10) => {
        try {
            setLoading(true);
            const response = await api.get("/api/admin/bookings/transactions", {
                params: { page, pageSize, ...filters },
            });

            setTransactions(response.data.data || []);
            setPagination(response.data.pagination || {});
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const applyFilters = () => {
        fetchTransactions(1); // reset to page 1 when filtering
    };

    if (loading) {
        return <div className="transactions-container">Loading transactions...</div>;
    }


    const columns = [
        { key: "id", label: "Booking ID" },
        { key: "tripName", label: "Trip Name" },
        {
            key: "customer",
            label: "Customer",
            render: (_, tx) => (
                <>
                    {tx.customerName || "N/A"}
                    <br />
                    <small className="text-muted">{tx.customerPhone || ""}</small>
                </>
            ),
        },
        {
            key: "provider",
            label: "Provider",
            render: (_, tx) => (
                <>
                    {tx.providerName}
                    <br />
                    <small className="text-muted">{tx.providerPhone}</small>
                </>
            ),
        },
        { key: "totalCost", label: "Customer Paid" },
        { key: "providerCommission", label: "Provider Commission" },
        { key: "appCommission", label: "App Commission" },
        { key: "gatewayCharges", label: "Gateway Charges" },
        { key: "tall3atNetProfit", label: "Tall3at NetProfit" },
        { key: "status", label: "Status" },
        {
            key: "bookingDate",
            label: "Booking Date",
            render: (v) =>
                new Date(v).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                }),
        },
    ];


    return (
        <div className="transactions-container notifications-list">
            <h2>Transactions</h2>

            {/* 🔹 Filters */}
            <div className="filters">
                <input
                    type="text"
                    name="customerName"
                    placeholder="Customer Name"
                    value={filters.customerName}
                    onChange={handleFilterChange}
                />
                <input
                    type="text"
                    name="providerName"
                    placeholder="Provider Name"
                    value={filters.providerName}
                    onChange={handleFilterChange}
                />
                <input
                    type="text"
                    name="tripTitle"
                    placeholder="Trip Title"
                    value={filters.tripTitle}
                    onChange={handleFilterChange}
                />
                <input
                    type="date"
                    name="bookingDate"
                    value={filters.bookingDate}
                    onChange={handleFilterChange}
                />
                <button onClick={applyFilters}>Search</button>
            </div>

            <CustomTable
                columns={columns}
                data={transactions}
                loading={loading}
                pagination={{
                    currentPage: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    onPageChange: (page) => fetchTransactions(page, pagination.pageSize),
                }}
                noDataMessage="No transactions found"
            />

        </div>
    );
};

export default Transactions;
