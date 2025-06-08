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

// 기여자별 릴리스 수 데이터 변환
export function prepareContributorData(releases: RawRelease[]) {
  // 기여자별 릴리스 수 집계
  const contributorCounts = releases.reduce(
    (acc, release) => {
      const author = release['Author Username']
      acc[author] = (acc[author] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // 도넛 차트 데이터 형식으로 변환
  const data = Object.entries(contributorCounts)
    .map(([name, value]) => ({
      name,
      value
    }))
    // 릴리스 수 기준으로 내림차순 정렬
    .sort((a, b) => b.value - a.value)

  // 상위 5명만 표시하고 나머지는 'Others'로 묶기
  if (data.length > 5) {
    const topContributors = data.slice(0, 5)
    const othersCount = data.slice(5).reduce((sum, item) => sum + item.value, 0)

    if (othersCount > 0) {
      topContributors.push({
        name: 'Others',
        value: othersCount
      })
    }

    return topContributors
  }

  return data
}

// 릴리스 타입별 데이터 변환
export function prepareReleaseTypeData(releases: RawRelease[]) {
  // 레포지토리별로 릴리스 타입 카운트
  const typesByRepo = releases.reduce(
    (acc, release) => {
      const repo = release.Repository
      if (!acc[repo]) {
        acc[repo] = {
          repository: repo,
          regular: 0,
          prerelease: 0,
          draft: 0
        }
      }

      if (release['Is Draft']) {
        acc[repo].draft += 1
      } else if (release['Is Prerelease']) {
        acc[repo].prerelease += 1
      } else {
        acc[repo].regular += 1
      }

      return acc
    },
    {} as Record<
      string,
      {
        repository: string
        regular: number
        prerelease: number
        draft: number
      }
    >
  )

  return Object.values(typesByRepo)
}

// 릴리스 노트 용어 분석 데이터 변환
export function prepareWordCloudData(releases: RawRelease[]) {
  // 불용어 목록 (필요에 따라 추가)
  const stopWords = new Set([
    'the',
    'be',
    'to',
    'of',
    'and',
    'a',
    'in',
    'that',
    'have',
    'i',
    'it',
    'for',
    'not',
    'on',
    'with',
    'he',
    'as',
    'you',
    'do',
    'at',
    'this',
    'but',
    'his',
    'by',
    'from',
    'they',
    'we',
    'say',
    'her',
    'she',
    'or',
    'an',
    'will',
    'my',
    'one',
    'all',
    'would',
    'there',
    'their',
    'what',
    'so',
    'up',
    'out',
    'if',
    'about',
    'who',
    'get',
    'which',
    'go',
    'me',
    // 기술 문서에서 자주 나오는 일반적인 단어들
    'fix',
    'fixed',
    'bug',
    'issue',
    'update',
    'updated',
    'change',
    'changed',
    'add',
    'added',
    'remove',
    'removed',
    'improve',
    'improved',
    'enhancement',
    'feature',
    'version',
    'release',
    'changelog',
    'readme',
    'documentation',
    'implement',
    'implemented',
    'support',
    'supported'
  ])

  // 모든 릴리스 노트 텍스트 결합
  const allText = releases
    .map(release => release.Description || '')
    .join(' ')
    .toLowerCase()

  // 특수문자 제거 및 단어 분리
  const words = allText
    .replace(/[^a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .filter(
      word =>
        word.length > 2 && // 3글자 이상
        !stopWords.has(word) && // 불용어 제외
        !/^\d+$/.test(word) // 숫자만으로 이루어진 단어 제외
    )

  // 단어 빈도수 계산
  const wordFreq = words.reduce(
    (acc, word) => {
      acc[word] = (acc[word] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // 상위 50개 단어 선택
  return Object.entries(wordFreq)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 50)
}
