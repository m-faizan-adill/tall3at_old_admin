import React, { useEffect, useState } from "react";
import "./DeletedPackage.css";
import api from "../../services/api";
import CustomTable from "../common/CustomTable";

const DeletedPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters state
  const [filters, setFilters] = useState({
    deletedByUserId: "",
    userRole: "",
    tripId: "",
    startDate: "",
    endDate: "",
  });

  const fetchDeletedPackages = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await api.get("/api/admin/deletedpackages", {
        params: { page, pageSize, ...filters },
      });

      console.log("API Response:", response.data);
      setPackages(response.data.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch deleted packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedPackages();
  }, []);

  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = () => {
    fetchDeletedPackages();
  };

  const handleResetFilters = () => {
    setFilters({
      deletedByUserId: "",
      userRole: "",
      tripId: "",
      startDate: "",
      endDate: "",
    });
    fetchDeletedPackages();
  };

  if (loading) return <p className="loading">Loading deleted packages...</p>;
  if (error) return <p className="error">{error}</p>;


  const columns = [
    { key: "packageId", label: "Package ID" },
    { key: "tripId", label: "Trip ID" },
    { key: "tripTitle", label: "Trip Title" },
    { key: "deletedByUserName", label: "Deleted By", render: (v) => v || "Unknown" },
    {
      key: "packageData",
      label: "Package Data",
      render: (data) => (
        <ul className="pkg-data">
          <li><b>Cost:</b> {data?.cost}</li>
          <li><b>Unit:</b> {data?.unit}</li>
          <li><b>Hours:</b> {data?.numberOfHours}</li>
          <li><b>Min:</b> {data?.minCount}</li>
          <li><b>Max:</b> {data?.maxCount}</li>
          <li><b>Status:</b> {data?.status}</li>
        </ul>
      ),
    },
    {
      key: "deletedAt",
      label: "Deleted At",
      render: (v) =>
        new Date(v).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
    },
    { key: "reason", label: "Reason" },
  ];


  return (
    <div className="deleted-packages notifications-list">
      <h2>Deleted Packages</h2>

      {/* Filter Section */}
      <div className="filter-container">

        <select
          name="userRole"
          value={filters.userRole}
          onChange={handleInputChange}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="provider">Provider</option>
        </select>
        <input
          type="number"
          name="tripId"
          placeholder="Trip ID"
          value={filters.tripId}
          onChange={handleInputChange}
        />
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleInputChange}
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleInputChange}
        />
        <button onClick={handleApplyFilters}>Apply</button>
        <button className="reset-btn" onClick={handleResetFilters}>
          Reset
        </button>
      </div>

      <CustomTable
        columns={columns}
        data={packages}
        loading={loading}
        pagination={null}
        noDataMessage="No deleted packages found."
      />
    </div>
  );
};

export default DeletedPackages;
