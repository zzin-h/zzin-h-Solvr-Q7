import { DashboardChart } from '../../types/dashboard'

interface ChartContainerProps {
  chart: DashboardChart
}

export function ChartContainer({ chart }: ChartContainerProps) {
  return (
    <div
      className="bg-white rounded-lg shadow p-4 min-h-[300px] flex flex-col"
      style={{
        minWidth: chart.minWidth,
        minHeight: chart.minHeight
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{chart.title}</h3>
          <p className="text-sm text-gray-500">{chart.description}</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-gray-50 rounded">
        <p className="text-gray-400">Chart: {chart.type}</p>
      </div>
    </div>
  )
}
