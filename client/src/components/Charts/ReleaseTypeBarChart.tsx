import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface ReleaseTypeBarChartProps {
  data: {
    repository: string
    regular: number
    prerelease: number
    draft: number
  }[]
}

export function ReleaseTypeBarChart({ data }: ReleaseTypeBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="repository" />
        <YAxis />
        <Tooltip
          formatter={(value: number, name: string) => {
            const displayNames = {
              regular: '일반 릴리스',
              prerelease: '프리릴리스',
              draft: '드래프트'
            }
            return [`${value}개`, displayNames[name as keyof typeof displayNames]]
          }}
        />
        <Legend
          formatter={(value: string) => {
            const displayNames = {
              regular: '일반 릴리스',
              prerelease: '프리릴리스',
              draft: '드래프트'
            }
            return displayNames[value as keyof typeof displayNames]
          }}
        />
        <Bar dataKey="regular" stackId="a" fill="#4CAF50" />
        <Bar dataKey="prerelease" stackId="a" fill="#2196F3" />
        <Bar dataKey="draft" stackId="a" fill="#9E9E9E" />
      </BarChart>
    </ResponsiveContainer>
  )
}
