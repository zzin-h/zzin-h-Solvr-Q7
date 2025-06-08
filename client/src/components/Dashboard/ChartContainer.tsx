import { useEffect, useState } from 'react'
import { DashboardChart } from '../../types/dashboard'
import {
  RawRelease,
  fetchReleaseData,
  prepareTimelineData,
  prepareCalendarData
} from '../../utils/data'
import { TimelineChart } from '../Charts/TimelineChart'
import { CalendarChart } from '../Charts/CalendarChart'

interface ChartContainerProps {
  chart: DashboardChart
}

export function ChartContainer({ chart }: ChartContainerProps) {
  const [data, setData] = useState<RawRelease[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const releaseData = await fetchReleaseData()
        setData(releaseData)
      } catch (err) {
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  function renderChart() {
    if (loading) return <div className="text-gray-400">Loading...</div>
    if (error) return <div className="text-red-500">{error}</div>
    if (!data.length) return <div className="text-gray-400">No data available</div>

    switch (chart.type) {
      case 'timeline':
        return <TimelineChart data={prepareTimelineData(data)} />
      case 'heatmap':
        return <CalendarChart data={prepareCalendarData(data)} />
      default:
        return <div className="text-gray-400">Chart type not implemented: {chart.type}</div>
    }
  }

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
      <div className="flex-1 flex items-center justify-center">{renderChart()}</div>
    </div>
  )
}
