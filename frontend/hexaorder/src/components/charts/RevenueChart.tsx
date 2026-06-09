import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Order } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface RevenueChartProps {
  orders: Order[];
  days?: number;
}

function subDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function formatDate(date: Date, formatStr: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = date.getDate();
  const month = months[date.getMonth()];
  
  if (formatStr === 'MMM dd') {
    return `${month} ${day}`;
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function RevenueChart({ orders, days = 7 }: RevenueChartProps) {
  const chartData = useMemo(() => {
    const data = [];
    const today = startOfDay(new Date());

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = formatDate(date, 'yyyy-MM-dd');
      
      const dayOrders = orders.filter(order => {
        const orderDate = formatDate(new Date(order.createdAt), 'yyyy-MM-dd');
        return orderDate === dateStr;
      });

      const completedRevenue = dayOrders
        .filter(o => o.status === 'COMPLETED')
        .reduce((sum, o) => sum + o.totalAmount, 0);

      const pendingRevenue = dayOrders
        .filter(o => o.status === 'PENDING')
        .reduce((sum, o) => sum + o.totalAmount, 0);

      data.push({
        date: formatDate(date, 'MMM dd'),
        completed: completedRevenue,
        pending: pendingRevenue,
        total: completedRevenue + pendingRevenue,
      });
    }

    return data;
  }, [orders, days]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
          <div className="mt-2 pt-2 border-t border-slate-200">
            <p className="text-sm font-semibold text-slate-900">
              Total: {formatCurrency(payload.reduce((sum: number, p: any) => sum + p.value, 0))}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="date" 
          stroke="#64748b"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#64748b"
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ fontSize: '12px' }}
          iconType="square"
        />
        <Bar 
          dataKey="completed" 
          fill="#10b981" 
          name="Completed Revenue"
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="pending" 
          fill="#f59e0b" 
          name="Pending Revenue"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}