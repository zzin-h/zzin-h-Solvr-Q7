import { ResponsiveCalendar } from '@nivo/calendar'
import { format, subMonths } from 'date-fns'

interface CalendarChartProps {
  data: {
    day: string
    value: number
  }[]
}

export function CalendarChart({ data }: CalendarChartProps) {
  const to = format(new Date(), 'yyyy-MM-dd')
  const from = format(subMonths(new Date(), 12), 'yyyy-MM-dd')

  return (
    <div style={{ height: '100%', minHeight: '300px' }}>
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
