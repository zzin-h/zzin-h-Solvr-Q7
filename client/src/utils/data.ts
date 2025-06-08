import { parse, parseISO, format } from 'date-fns'

export interface RawRelease {
  Repository: string
  'Release ID': number
  'Tag Name': string
  'Release Name': string | null
  'Published At': string
  'Created At': string
  'Author Username': string
  'Is Draft': boolean
  'Is Prerelease': boolean
  Description: string | null
  'Release URL': string
  'Is Weekday': boolean
  Year: string
  Month: string
  Week: string
  'Day of Week': number
}

export async function fetchReleaseData(): Promise<RawRelease[]> {
  try {
    const response = await fetch('/release-raw-data.csv')
    const csvText = await response.text()

    // console.log('CSV 응답 상태:', response.status, response.statusText)
    // console.log('CSV 헤더:', response.headers.get('content-type'))

    // 빈 행 제거
    const lines = csvText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)

    // console.log('처리된 라인 수:', lines.length)
    // console.log('첫 번째 라인(헤더):', lines[0])
    if (lines.length > 1) {
      console.log('두 번째 라인(첫 데이터):', lines[1])
    }

    const headers = lines[0].split(',').map(h => h.trim())

    const releases = lines
      .slice(1)
      .map(line => {
        const values = line.split(',').map(v => v.trim())
        // 컬럼 개수가 안 맞으면 버린다
        if (values.length !== headers.length) {
          console.log('컬럼 개수 불일치:', { expected: headers.length, got: values.length, line })
          return null
        }
        const record: any = {}

        headers.forEach((header, index) => {
          const value = values[index]
          if (value === undefined || value === '') return

          // 타입 변환 (지금 네가 쓰는 부분 유지)
          if (header === 'Release ID') {
            record[header] = parseInt(value)
          } else if (
            header === 'Is Draft' ||
            header === 'Is Prerelease' ||
            header === 'Is Weekday'
          ) {
            record[header] = value.toLowerCase() === 'true'
          } else if (header === 'Day of Week') {
            record[header] = parseInt(value)
          } else if (header === 'Release Name' || header === 'Description') {
            record[header] = value === 'null' ? null : value
          } else {
            record[header] = value
          }
        })

        return record as RawRelease
      })
      .filter((record): record is RawRelease => record !== null)

    console.log('파싱된 릴리즈 데이터 샘플:', releases.slice(0, 2))
    return releases
  } catch (error) {
    console.error('Error fetching release data:', error)
    return []
  }
}

// 시계열 차트용 데이터 변환
export function prepareTimelineData(releases: RawRelease[]) {
  const monthlyData = releases.reduce(
    (acc, release) => {
      const month = release.Month
      acc[month] = (acc[month] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return Object.entries(monthlyData)
    .map(([month, count]) => ({
      month,
      count
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

// 히트맵 캘린더용 데이터 변환
export function prepareCalendarData(releases: RawRelease[]) {
  // 날짜별 릴리스 카운트를 저장할 객체
  const dateCount: Record<string, number> = {}

  // 각 릴리스의 날짜를 YYYY-MM-DD 형식으로 변환하고 카운트
  releases.forEach(release => {
    const published = release['Published At']
    if (!published) return

    // ISO 날짜 문자열을 파싱하고 YYYY-MM-DD 형식으로 변환
    try {
      const day = format(parseISO(published), 'yyyy-MM-dd')
      dateCount[day] = (dateCount[day] || 0) + 1
      //   console.log(dateCount)
    } catch (error) {
      console.error('날짜 변환 오류:', { published, error })
    }
  })

  // nivo-calendar가 기대하는 형식으로 변환
  const calendarData = Object.entries(dateCount).map(([day, value]) => ({
    day,
    value
  }))

  // 디버깅을 위한 로그
  console.log('Calendar 데이터:', calendarData)

  return calendarData
}

// 요일별 분포 데이터 변환
export function prepareWeekdayData(releases: RawRelease[]) {
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const counts = releases.reduce(
    (acc, release) => {
      const dayIndex = release['Day of Week'] - 1
      const day = weekdays[dayIndex]
      acc[day] = (acc[day] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return weekdays.map(day => ({
    name: day,
    count: counts[day] || 0
  }))
}

// 시간대별 분포 데이터 변환
export function prepareTimeDistributionData(releases: RawRelease[]) {
  const hourCounts = releases.reduce(
    (acc, release) => {
      const hour = parse(
        release['Published At'],
        "yyyy-MM-dd'T'HH:mm:ss'Z'",
        new Date()
      ).getUTCHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour}:00`,
    count: hourCounts[hour] || 0
  }))
}
