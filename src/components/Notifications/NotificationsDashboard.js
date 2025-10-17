import React, { useEffect, useMemo, useState } from "react";
import "./NotificationsDashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUsers,
    faUserTie,
    faSearch,
    faPaperPlane,
    faExclamationTriangle,
    faCheckSquare,
    faSquare
} from "@fortawesome/free-solid-svg-icons";
import { API_CONFIG } from "../../constants/config";

const API_BASE = API_CONFIG.BASE_URL + '/api/admin';

// const PROVIDERS_API = `${API_BASE}/providers`;
const CUSTOMERS_API = `${API_BASE}/users?page=1&pageSize=2147483647`;
// const FETCH_USERS = `${API_BASE}/user-ids`;
const SEND_NOTIFICATION = `${API_BASE}/broadcast-to-users`;

// Small helper to read common display fields safely
const displayName = (u) => u?.name || u?.fullName || u?.companyName || "—";
const displayEmail = (u) => u?.email || "—";
// ...existing code...
const displayPhone = (u) => {
    // Pehle phone, phir phoneNumber, phir userName
    let phone = u?.userName || u?.phoneNumber || "";
    if (!phone) return "—";
    phone = phone.replace(/\+/g, "");
    // Remove spaces
    phone = phone.trim();
    // Add + at the start
    const result = `+${phone}`;
    return result;
};

const displayId = (u) => {
    // Pehle actual IDs check karo
    if (u?.id) return u.id;

    return `fallback-${Math.random().toString(36).substr(2, 9)}`;
};

const TabKey = {
    CUSTOMERS: "customers",
    PROVIDERS: "providers",
};

const NotificationsDashboard = () => {
    const [activeTab, setActiveTab] = useState(TabKey.CUSTOMERS);

    const [customers, setCustomers] = useState([]);
    const [providers, setProviders] = useState([]);
    // console.log("Customers:", customers);
    // console.log("Providers:", providers);

    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [loadingProviders, setLoadingProviders] = useState(false);

    const [errorCustomers, setErrorCustomers] = useState("");
    const [errorProviders, setErrorProviders] = useState("");

    const [searchCustomers, setSearchCustomers] = useState("");
    const [searchProviders, setSearchProviders] = useState("");

    const [selectedCustomers, setSelectedCustomers] = useState(new Set());
    const [selectedProviders, setSelectedProviders] = useState(new Set());
    // console.log("Selected Customers:", selectedCustomers);
    // console.log("Selected Providers with array:", Array.from(selectedProviders));
    console.log("Selected Providers:", selectedProviders);

    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [sending, setSending] = useState(false);
    const [toast, setToast] = useState(null); // {type: 'success'|'error', msg: string}

    const [selectedCities, setSelectedCities] = useState([]);

    // Fetch data on mount
    useEffect(() => {

        // const toArray = (payload) =>
        //     Array.isArray(payload) ? payload : payload?.data ?? payload?.results ?? [];

        const authHeaders = () => {
            const token = localStorage.getItem("token");
            return {
                Accept: "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            };
        };
        const fetchCustomers = async () => {
            setLoadingCustomers(true);
            setErrorCustomers("");
            try {
                const res = await fetch(`${CUSTOMERS_API}`,
                    { headers: authHeaders() }

                );
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();

                const arr = Array.isArray(data) ? data : data?.data ?? data?.results ?? [];
                const onlyCustomers = arr.filter(user => user.role === "customer");
                // console.log("Customers data:", onlyCustomers.map((u) => u.role));
                setCustomers(onlyCustomers);

            } catch (e) {
                setErrorCustomers("Failed to load customers.");
            } finally {
                setLoadingCustomers(false);
            }
        };

        const fetchProviders = async () => {
            setLoadingProviders(true);
            setErrorProviders("");
            try {
                const res = await fetch(CUSTOMERS_API, { headers: authHeaders() });
                // console.log("Providers API:", res.url, res.status, res.statusText, res);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();

                const arr = Array.isArray(data) ? data : data?.data ?? data?.results ?? [];
                const onlyProvider = arr.filter(user => user.role === "provider");
                // console.log("Provider data:", onlyProvider.map((u) => u.role));
                setProviders(onlyProvider);

                // console.log("Providers data:", data.data);
            } catch (e) {
                setErrorProviders("Failed to load providers.");
            } finally {
                setLoadingProviders(false);
            }
        };

        fetchCustomers();
        fetchProviders();
    }, []);

    const filteredCustomers = useMemo(() => {
        const q = searchCustomers.trim().toLowerCase();
        let list = customers;

        if (selectedCities.length > 0) {
            list = list.filter((u) => selectedCities.includes(u.cityId));
        }

        if (!q) return list;

        return list.filter((u) =>
            [displayName(u), displayEmail(u), displayPhone(u)]
                .join(" ")
                .toLowerCase()
                .includes(q)
        );
    }, [customers, searchCustomers, selectedCities]);

    const filteredProviders = useMemo(() => {
        const q = searchProviders.trim().toLowerCase();
        let list = providers;

        if (selectedCities.length > 0) {
            list = list.filter((u) => selectedCities.includes(u.cityId));
        }

        if (!q) return list;

        return list.filter((u) =>
            [displayName(u), displayEmail(u), displayPhone(u)]
                .join(" ")
                .toLowerCase()
                .includes(q)
        );
    }, [providers, searchProviders, selectedCities]);

    // Derived filtered lists
    // const filteredCustomers = useMemo(() => {
    //     const q = searchCustomers.trim().toLowerCase();
    //     if (!q) return customers;
    //     return customers.filter((u) =>
    //         [displayName(u), displayEmail(u), displayPhone(u)]
    //             .join(" ")
    //             .toLowerCase()
    //             .includes(q)
    //     );
    // }, [customers, searchCustomers]);

    // const filteredProviders = useMemo(() => {
    //     const q = searchProviders.trim().toLowerCase();
    //     if (!q) return providers;
    //     return providers.filter((u) =>
    //         [displayName(u), displayEmail(u), displayPhone(u)]
    //             .join(" ")
    //             .toLowerCase()
    //             .includes(q)
    //     );
    // }, [providers, searchProviders]);

    // Selection helpers
    const toggleUser = (tab, id) => {
        if (tab === TabKey.CUSTOMERS) {
            setSelectedCustomers((prev) => {
                const next = new Set(prev);
                next.has(id) ? next.delete(id) : next.add(id);
                return next;
            });
        } else {
            setSelectedProviders((prev) => {
                const next = new Set(prev);
                next.has(id) ? next.delete(id) : next.add(id);
                return next;
            });
        }
    };

    const allSelectedOnTab = (tab) => {
        const list =
            tab === TabKey.CUSTOMERS ? filteredCustomers : filteredProviders;
        const sel =
            tab === TabKey.CUSTOMERS ? selectedCustomers : selectedProviders;
        return list.length > 0 && list.every((u) => sel.has(displayId(u)));
    };

    const toggleSelectAll = (tab) => {
        const list =
            tab === TabKey.CUSTOMERS ? filteredCustomers : filteredProviders;
        const sel =
            tab === TabKey.CUSTOMERS ? selectedCustomers : selectedProviders;
        const setter =
            tab === TabKey.CUSTOMERS ? setSelectedCustomers : setSelectedProviders;

        const currentlyAll = list.length > 0 && list.every((u) => sel.has(displayId(u)));
        if (currentlyAll) {
            // unselect all filtered
            const next = new Set(sel);
            list.forEach((u) => next.delete(displayId(u)));
            setter(next);
        } else {
            // select all filtered
            const next = new Set(sel);
            list.forEach((u) => next.add(displayId(u)));
            setter(next);
        }
    };

    // Form submit
    const handleSend = async () => {
        const isCustomers = activeTab === TabKey.CUSTOMERS;
        const selected = isCustomers ? selectedCustomers : selectedProviders;
        // console.log("Sending to:", selected);   
        const recipients = Array.from(selected);
        // console.log("Recipients IDs:", recipients);

        if (!title.trim() || !body.trim() || recipients.length === 0) {
            setToast({
                type: "error",
                msg:
                    !title.trim()
                        ? "Please enter a title."
                        : !body.trim()
                            ? "Please enter a message body."
                            : "Please select at least one recipient.",
            });
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to send this message to ${recipients.length} ${isCustomers ? "customer(s)" : "provider(s)"}?`
        );
        if (!confirmed) return;

        setSending(true);
        setToast(null);
        try {
            await fetch(SEND_NOTIFICATION, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    userIds: recipients,
                    title: title.trim(),
                    body: body.trim(),
                }),
            });


            setToast({ type: "success", msg: "Message sent successfully." });
            // Optional: clear selection and form
            isCustomers ? setSelectedCustomers(new Set()) : setSelectedProviders(new Set());
            // keep title/body? If not, clear:
        } catch (e) {
            setToast({ type: "error", msg: "Failed to send message." });
        } finally {
            setSending(false);
            // auto-hide toast
            setTimeout(() => setToast(null), 3500);
        }
    };

    const list = activeTab === TabKey.CUSTOMERS ? filteredCustomers : filteredProviders;
    const selectedCount =
        activeTab === TabKey.CUSTOMERS ? selectedCustomers.size : selectedProviders.size;

    const CITIES = [
        { id: 3, name: "أبها", nameEn: "Abha" },
        { id: 17, name: "الجبيل", nameEn: "Jubail" },
        { id: 37, name: "الخبر و الدمام", nameEn: "Al-Khobar Dammam" },
        { id: 55, name: "حايل", nameEn: "Hail" },
        { id: 56, name: "الطايف", nameEn: "Taif" },
    ];




    return (
        <div className="notifications-list">
            {/* Header */}
            <div className="notif-header">
                <div className="notif-title">
                    <FontAwesomeIcon icon={faPaperPlane} />
                    <h1>Notifications</h1>
                </div>

                <div className="notif-tabs" role="tablist" aria-label="Recipient type">
                    <button
                        className={`notif-tab ${activeTab === TabKey.CUSTOMERS ? "active" : ""}`}
                        role="tab"
                        aria-selected={activeTab === TabKey.CUSTOMERS}
                        onClick={() => setActiveTab(TabKey.CUSTOMERS)}
                    >
                        <FontAwesomeIcon icon={faUsers} />
                        Customers
                    </button>
                    <button
                        className={`notif-tab ${activeTab === TabKey.PROVIDERS ? "active" : ""}`}
                        role="tab"
                        aria-selected={activeTab === TabKey.PROVIDERS}
                        onClick={() => setActiveTab(TabKey.PROVIDERS)}
                    >
                        <FontAwesomeIcon icon={faUserTie} />
                        Providers
                    </button>
                </div>
            </div>

            {/* Controls Row */}
            <div className="notif-controls">


                <div className="search">
                    <FontAwesomeIcon icon={faSearch} />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab === TabKey.CUSTOMERS ? "customers" : "providers"} by name, email, phone...`}
                        value={activeTab === TabKey.CUSTOMERS ? searchCustomers : searchProviders}
                        onChange={(e) =>
                            activeTab === TabKey.CUSTOMERS
                                ? setSearchCustomers(e.target.value)
                                : setSearchProviders(e.target.value)
                        }
                    />
                </div>



                <div className="bulk">
                    <button
                        className="select-all"
                        onClick={() => toggleSelectAll(activeTab)}
                        disabled={list.length === 0}
                        title="Toggle select all (filtered)"
                    >
                        <FontAwesomeIcon icon={allSelectedOnTab(activeTab) ? faCheckSquare : faSquare} />
                        {allSelectedOnTab(activeTab) ? "Unselect all" : "Select all"} ({list.length})
                    </button>
                    <span className="selected-count">
                        Selected: <strong>{selectedCount}</strong>
                    </span>
                </div>


            </div>
            <div className="city-filters">
                {CITIES.map((city) => (
                    <label key={city.id} className="city-checkbox">
                        <input
                            type="checkbox"
                            checked={selectedCities.includes(city.id)}
                            onChange={() => {
                                setSelectedCities((prev) =>
                                    prev.includes(city.id)
                                        ? prev.filter((id) => id !== city.id)
                                        : [...prev, city.id]
                                );
                            }}
                        />
                        {city.nameEn}
                    </label>
                ))}
            </div>


            <div className="notif-grid">
                {/* LEFT: List */}
                <div className="notif-card list">
                    {activeTab === TabKey.CUSTOMERS ? (
                        <>
                            <div className="card-head">
                                <h2>
                                    <FontAwesomeIcon icon={faUsers} /> Customers
                                </h2>
                            </div>
                            {loadingCustomers ? (
                                <ListSkeleton />
                            ) : errorCustomers ? (
                                <ErrorBlock msg={errorCustomers} />
                            ) : list.length === 0 ? (
                                <EmptyBlock query={searchCustomers} />
                            ) : (
                                <UserList
                                    users={list}
                                    selected={selectedCustomers}
                                    onToggle={(id) => toggleUser(TabKey.CUSTOMERS, id)}
                                />
                            )}
                        </>
                    ) : (
                        <>
                            <div className="card-head">
                                <h2>
                                    <FontAwesomeIcon icon={faUserTie} /> Providers
                                </h2>
                            </div>
                            {loadingProviders ? (
                                <ListSkeleton />
                            ) : errorProviders ? (
                                <ErrorBlock msg={errorProviders} />
                            ) : list.length === 0 ? (
                                <EmptyBlock query={searchProviders} />
                            ) : (
                                <UserList
                                    users={list}
                                    selected={selectedProviders}
                                    onToggle={(id) => toggleUser(TabKey.PROVIDERS, id)}
                                />
                            )}
                        </>
                    )}
                </div>

                {/* RIGHT: Compose */}
                <div className="notif-card compose">
                    <div className="card-head">
                        <h2>
                            <FontAwesomeIcon icon={faPaperPlane} /> Compose Message
                        </h2>
                        <div className="meta">
                            Sending to:{" "}
                            <strong>
                                {activeTab === TabKey.CUSTOMERS ? "Selected Customers" : "Selected Providers"}
                            </strong>
                        </div>
                    </div>

                    <div className="form">
                        <label className="lbl" htmlFor="title">
                            Title
                        </label>
                        <input
                            id="title"
                            className="input"
                            placeholder="Enter notification title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <label className="lbl" htmlFor="body">
                            Body
                        </label>
                        <textarea
                            id="body"
                            className="textarea"
                            placeholder="Write your message…"
                            rows={8}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                        />

                        <button
                            className="send-btn"
                            onClick={handleSend}
                            disabled={sending || !title.trim() || !body.trim() || selectedCount === 0}
                        >
                            <FontAwesomeIcon icon={faPaperPlane} />
                            {sending ? "Sending…" : "Send Message"}
                        </button>

                        <p className="hint">
                            Tip: use the search + “Select all” to broadcast to a filtered segment.
                        </p>
                    </div>
                </div>
            </div>

            {toast && (
                <div className={`toast ${toast.type}`}>
                    {toast.type === "error" && <FontAwesomeIcon icon={faExclamationTriangle} />}{" "}
                    {toast.msg}
                </div>
            )}
        </div>
    );
};

const UserList = ({ users, selected, onToggle }) => {
    return (
        <ul className="user-list" role="listbox" aria-label="Recipients">
            {users.map((u) => {
                const id = displayId(u);
                const isChecked = selected.has(id);

                return (
                    <li key={id} className={`user-row ${isChecked ? "checked" : ""}`}>
                        <label className="row-inner">
                            <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => onToggle(id)}
                                aria-label={`Select ${displayName(u)}`}
                            />
                            <div className="user-meta">
                                <div className="u-name">{displayName(u)}</div>
                                <div className="u-sub">
                                    <span>{displayEmail(u)}</span>
                                    <span>•</span>
                                    <span>{displayPhone(u)}</span>
                                </div>
                            </div>
                        </label>
                    </li>
                );
            })}
        </ul>
    );
};

const ListSkeleton = () => (
    <div className="skeleton-wrap">
        {Array.from({ length: 7 }).map((_, i) => (
            <div className="sk-row" key={i}>
                <div className="sk-check" />
                <div className="sk-lines">
                    <div className="sk-line w1" />
                    <div className="sk-line w2" />
                </div>
            </div>
        ))}
    </div>
);

const ErrorBlock = ({ msg }) => (
    <div className="state state-error">
        <FontAwesomeIcon icon={faExclamationTriangle} />
        <div>{msg}</div>
        <div className="small">Check API_BASE or network and retry.</div>
    </div>
);

const EmptyBlock = ({ query }) => (
    <div className="state">
        <div>No results {query ? `for “${query}”` : ""}.</div>
        <div className="small">Try a different search.</div>
    </div>
);

export default NotificationsDashboard;
