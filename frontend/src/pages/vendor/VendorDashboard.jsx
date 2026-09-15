import { useEffect, useState } from 'react';
import { vendorApi } from '../../api';
import { formatPrice } from '../../utils/helpers';
import { LoadingCenter } from '../../components/common';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function VendorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorApi.getDashboard().then((r)=>setData(r.data.data)).finally(()=>setLoading(false));
  }, []);

  if (loading) return <LoadingCenter />;

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const chartData = data?.monthlyData?.map((m)=>({ name: MONTHS[m._id.month-1], revenue: m.revenue, orders: m.orders?.length||0 })) || [];

  const stats = [
    { label:'Total Revenue', value:formatPrice(data?.totalRevenue||0), icon:'💰', color:'#dbeafe' },
    { label:'Total Orders', value:data?.totalOrders||0, icon:'📦', color:'#d1fae5' },
    { label:'Total Products', value:data?.totalProducts||0, icon:'🏷️', color:'#fef3c7' },
    { label:'Pending Orders', value:data?.pendingOrders||0, icon:'⏳', color:'#fee2e2' },
  ];

  return (
    <div>
      <h1 style={{ fontSize:'1.5rem', fontWeight:700, marginBottom:'1.5rem' }}>Dashboard</h1>
      <div className="grid grid-4" style={{ marginBottom:'2rem' }}>
        {stats.map((s)=>(
          <div key={s.label} className="stat-card">
            <div className="stat-card-icon" style={{ background:s.color }}>{s.icon}</div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>
      {chartData.length>0 && (
        <div className="card">
          <div className="card-header"><h3 style={{ fontWeight:700 }}>Revenue (Last 6 Months)</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v)=>`$${v}`} />
                <Tooltip formatter={(v)=>formatPrice(v)} />
                <Bar dataKey="revenue" fill="#2563eb" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
