import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts'

interface TimeRadarChartProps {
  data: {
    hour: string
    count: number
  }[]
}

export function TimeRadarChart({ data }: TimeRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="hour" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
        <Radar name="릴리스 수" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  )
}
