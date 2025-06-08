import { ResponsiveCalendar } from '@nivo/calendar'
import { format, parseISO, min, max } from 'date-fns'

interface CalendarChartProps {
  data: {
    day: string
    value: number
  }[]
}

export function CalendarChart({ data }: CalendarChartProps) {
  // 데이터에서 가장 이른 날짜와 가장 늦은 날짜를 찾습니다
  const dates = data.map(d => parseISO(d.day))
  const minDate = min(dates)
  const maxDate = max(dates)

  // 날짜 범위를 YYYY-MM-DD 형식으로 변환
  const from = format(minDate, 'yyyy-MM-dd')
  const to = format(maxDate, 'yyyy-MM-dd')

  console.log('Calendar range:', { from, to, dataPoints: data.length })

  return (
    <div style={{ height: '100%', minHeight: '300px', width: '100%' }}>
      <ResponsiveCalendar
        data={data}
        from={from}
        to={to}
        emptyColor="#eeeeee"
        colors={['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560']}
        margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
        yearSpacing={40}
        monthBorderColor="#ffffff"
        dayBorderWidth={2}
        dayBorderColor="#ffffff"
        monthLegend={(year, month) => format(new Date(year, month), 'MMM')}
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'row',
            translateY: 36,
            itemCount: 4,
            itemWidth: 42,
            itemHeight: 36,
            itemsSpacing: 14,
            itemDirection: 'right-to-left'
          }
        ]}
      />
    </div>
  )
}
