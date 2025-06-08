import { useEffect, useState } from 'react'
import { DashboardChart } from '../../types/dashboard'
import {
  RawRelease,
  fetchReleaseData,
  prepareTimelineData,
  prepareCalendarData,
  prepareWeekdayData,
  prepareTimeDistributionData
} from '../../utils/data'
import { TimelineChart } from '../Charts/TimelineChart'
import { CalendarChart } from '../Charts/CalendarChart'
import { WeekdayBarChart } from '../Charts/WeekdayBarChart'
import { TimeRadarChart } from '../Charts/TimeRadarChart'

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
        const timelineData = prepareTimelineData(data)
        return (
          <div className="w-full h-[400px]">
            <TimelineChart data={timelineData} />
          </div>
        )
      case 'heatmap':
        const calendarData = prepareCalendarData(data)
        return (
          <div className="w-full h-[400px]">
            <CalendarChart data={calendarData} />
          </div>
        )
      case 'bar':
        const weekdayData = prepareWeekdayData(data)
        return (
          <div className="w-full h-[400px]">
            <WeekdayBarChart data={weekdayData} />
          </div>
        )
      case 'radar':
        const timeDistData = prepareTimeDistributionData(data)
        return (
          <div className="w-full h-[400px]">
            <TimeRadarChart data={timeDistData} />
          </div>
        )
      default:
        return <div className="text-gray-400">Chart type not implemented: {chart.type}</div>
    }
  }

  return (
    <div
      className={`bg-white rounded-lg shadow p-4 flex flex-col w-full ${
        chart.type === 'heatmap' ? 'min-h-[500px]' : 'min-h-[300px]'
      }`}
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
