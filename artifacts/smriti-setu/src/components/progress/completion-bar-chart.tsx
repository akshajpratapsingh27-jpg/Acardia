import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DayCompletion } from '@/types/care';

export function CompletionBarChart({ data }: { data: DayCompletion[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(36 27% 84%)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: 'hsl(204 16% 43%)' }}
            axisLine={{ stroke: 'hsl(36 27% 84%)' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: 'hsl(204 16% 43%)' }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            cursor={{ fill: 'hsl(174 42% 43% / 0.08)' }}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid hsl(36 27% 84%)',
              fontSize: 13,
            }}
            formatter={(value: number) => [`${value}%`, 'Completion']}
          />
          <Bar dataKey="percent" radius={[6, 6, 0, 0]} fill="hsl(18 72% 63%)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
