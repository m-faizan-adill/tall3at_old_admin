import React, { useEffect, useState } from 'react';
import ApexChart from 'react-apexcharts';
import axios from 'axios';
import './Home.css';

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5030/api/admin/dashboard')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('حدث خطأ أثناء جلب البيانات');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">جاري التحميل...</div>
      </div>
    );
  }
  
  if (error) return <div className="dashboard-error">{error}</div>;
  if (!data) return null;

  const { statistics, chartData, categoryStats, cityStats, recentActivities } = data;

  // Card data
  const statCards = [
    {
      label: 'المستخدمون',
      value: statistics.users.total,
      icon: 'fa-users',
      color: '#1fc1de',
      sub: `جديد هذا الشهر: ${statistics.users.newThisMonth}`
    },
    {
      label: 'مزودي الخدمات',
      value: statistics.users.providers,
      icon: 'fa-briefcase',
      color: '#00a6c9',
      sub: `العملاء: ${statistics.users.customers}`
    },
    {
      label: 'الطلعات',
      value: statistics.trips.total,
      icon: 'fa-route',
      color: '#1fc1de',
      sub: `مميزة: ${statistics.trips.featured}`
    },
    {
      label: 'الحجوزات',
      value: statistics.bookings.total,
      icon: 'fa-calendar-check',
      color: '#00a6c9',
      sub: `هذا الشهر: ${statistics.bookings.thisMonth}`
    },
    {
      label: 'الإيرادات',
      value: statistics.revenue.total,
      icon: 'fa-coins',
      color: '#1fc1de',
      sub: `عمولة التطبيق: ${statistics.revenue.totalAppCommission}`
    }
  ];

  // Chart configs
  const revenueChart = {
    options: {
      chart: { id: 'revenue', fontFamily: 'Cairo, Tajawal, Noto Kufi Arabic, Arial' },
      xaxis: { categories: chartData.monthlyRevenue.map(m => m.label) },
      colors: ['#1fc1de'],
    },
    series: [{ name: 'الإيرادات', data: chartData.monthlyRevenue.map(m => m.value) }]
  };

  const bookingsChart = {
    options: {
      chart: { id: 'bookings', fontFamily: 'Cairo, Tajawal, Noto Kufi Arabic, Arial' },
      xaxis: { categories: chartData.dailyBookings.map(d => d.label) },
      colors: ['#00a6c9'],
    },
    series: [{ name: 'الحجوزات', data: chartData.dailyBookings.map(d => d.value) }]
  };

  const usersChart = {
    options: {
      chart: { id: 'users', fontFamily: 'Cairo, Tajawal, Noto Kufi Arabic, Arial' },
      xaxis: { categories: chartData.dailyUsers.map(d => d.label) },
      colors: ['#1fc1de'],
    },
    series: [{ name: 'مستخدمون جدد', data: chartData.dailyUsers.map(d => d.value) }]
  };

    return (
    <div className="dashboard-home">
      <div className="dashboard-cards">
        {statCards.map((card, i) => (
          <div className="dashboard-card" key={i} style={{ borderTop: `3px solid ${card.color}` }}>
            <div className="card-icon" style={{ background: card.color }}><span className={`fa ${card.icon}`}></span></div>
            <div className="card-info">
              <div className="card-label">{card.label}</div>
              <div className="card-value">{card.value}</div>
              <div className="card-sub">{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-charts">
        <div className="dashboard-chart">
          <div className="chart-title">الإيرادات الشهرية</div>
          <div className="chart-actions"><button className="chart-action-btn"></button></div>
          <ApexChart options={revenueChart.options} series={revenueChart.series} type="bar" height={260} />
        </div>
        <div className="dashboard-chart">
          <div className="chart-title">الحجوزات اليومية</div>
          <div className="chart-actions"><button className="chart-action-btn"></button></div>
          <ApexChart options={bookingsChart.options} series={bookingsChart.series} type="bar" height={260} />
        </div>
        <div className="dashboard-chart">
          <div className="chart-title">المستخدمون الجدد يومياً</div>
          <div className="chart-actions"><button className="chart-action-btn"></button></div>
          <ApexChart options={usersChart.options} series={usersChart.series} type="line" height={260} />
        </div>
      </div>

      <div className="dashboard-tables">
        <div className="dashboard-table">
          <div className="table-title">إحصائيات الفئات</div>
          <table>
            <thead>
              <tr>
                <th>الفئة</th>
                <th>عدد الطلعات</th>
                <th>عدد الحجوزات</th>
                <th>الإيرادات</th>
              </tr>
            </thead>
            <tbody>
              {categoryStats.map(cat => (
                <tr key={cat.categoryId}>
                  <td>{cat.categoryName}</td>
                  <td>{cat.tripCount}</td>
                  <td>{cat.bookingCount}</td>
                  <td>{cat.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="dashboard-table">
          <div className="table-title">إحصائيات المدن</div>
          <table>
            <thead>
              <tr>
                <th>المدينة</th>
                <th>عدد الطلعات</th>
                <th>عدد المزودين</th>
                <th>عدد الحجوزات</th>
                <th>الإيرادات</th>
              </tr>
            </thead>
            <tbody>
              {cityStats.map(city => (
                <tr key={city.cityId}>
                  <td>{city.cityName}</td>
                  <td>{city.tripCount}</td>
                  <td>{city.providerCount}</td>
                  <td>{city.bookingCount}</td>
                  <td>{city.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-activities">
        <div className="dashboard-activity">
          <div className="activity-title">آخر الحجوزات</div>
          <ul>
            {recentActivities.recentBookings.map(b => (
              <li key={b.id}>
                <span className="fa fa-calendar-check activity-icon"></span>
                <span>{b.tripTitle}</span>
                <span>({b.userName})</span>
                <span>{b.status}</span>
                <span>{b.totalCost} ريال</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="dashboard-activity">
          <div className="activity-title">آخر المستخدمين</div>
          <ul>
            {recentActivities.recentUsers.map(u => (
              <li key={u.id}>
                <span className="fa fa-user activity-icon"></span>
                <span>{u.fullName}</span>
                <span>({u.role})</span>
                <span>{u.email}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="dashboard-activity">
          <div className="activity-title">آخر الطلعات</div>
          <ul>
            {recentActivities.recentTrips.map(t => (
              <li key={t.id}>
                <span className="fa fa-route activity-icon"></span>
                <span>{t.title}</span>
                <span>({t.cityName})</span>
                <span>{t.providerName}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}