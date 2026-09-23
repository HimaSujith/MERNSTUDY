import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Single-series bar chart: one hue is sufficient (see dataviz skill "one hue" rule),
// no legend needed for a single series.
const BAR_COLOR = '#2a78d6';
const GRID_COLOR = '#e1e0d9';
const AXIS_COLOR = '#898781';

const STAGES = ['New', 'Contacted', 'Site Visit Scheduled', 'Site Visit Done', 'Negotiation', 'Converted', 'Lost'];

export default function PipelineFunnelChart({ pipeline }) {
  const data = STAGES.map((stage) => ({ stage, count: pipeline?.[stage] || 0 }));

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">Pipeline by stage</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={GRID_COLOR} strokeWidth={1} />
          <XAxis
            dataKey="stage"
            tick={{ fill: AXIS_COLOR, fontSize: 11 }}
            axisLine={{ stroke: GRID_COLOR }}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fill: AXIS_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: '#f9f9f7' }}
            contentStyle={{ borderRadius: 6, borderColor: '#e1e0d9', fontSize: 12 }}
          />
          <Bar dataKey="count" fill={BAR_COLOR} radius={[4, 4, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
