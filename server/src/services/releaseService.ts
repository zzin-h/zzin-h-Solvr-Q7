import { parse, parseISO, format } from 'date-fns'
import fs from 'fs/promises'
import path from 'path'
import {
  RawRelease,
  TimelineData,
  CalendarData,
  WeekdayData,
  TimeDistributionData,
  ContributorData,
  ReleaseTypeData,
  WordCloudData,
  DashboardData
} from '../types/release'

class ReleaseService {
  private releases: RawRelease[] = []

  async loadData(): Promise<void> {
    try {
      const csvPath = path.join(process.cwd(), 'data', 'release-raw-data.csv')
      const csvText = await fs.readFile(csvPath, 'utf-8')

      // 빈 행 제거
      const lines = csvText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)

      const headers = lines[0].split(',').map(h => h.trim())

      this.releases = lines
        .slice(1)
        .map(line => {
          const values = line.split(',').map(v => v.trim())
          if (values.length !== headers.length) return null

          const record: any = {}
          headers.forEach((header, index) => {
            const value = values[index]
            if (value === undefined || value === '') return

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

      console.log('데이터 로딩 완료:', this.releases.length, '개의 릴리스')
    } catch (error) {
      console.error('데이터 로딩 실패:', error)
      throw error
    }
  }

  getTimelineData(): TimelineData[] {
    const monthlyData = this.releases.reduce(
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

  getCalendarData(): CalendarData[] {
    const dateCount: Record<string, number> = {}

    this.releases.forEach(release => {
      const published = release['Published At']
      if (!published) return

      try {
        const day = format(parseISO(published), 'yyyy-MM-dd')
        dateCount[day] = (dateCount[day] || 0) + 1
      } catch (error) {
        console.error('날짜 변환 오류:', { published, error })
      }
    })

    return Object.entries(dateCount).map(([day, value]) => ({
      day,
      value
    }))
  }

  getWeekdayData(): WeekdayData[] {
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const counts = this.releases.reduce(
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

  getTimeDistributionData(): TimeDistributionData[] {
    const hourCounts = this.releases.reduce(
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

  getContributorData(): ContributorData[] {
    const contributorCounts = this.releases.reduce(
      (acc, release) => {
        const author = release['Author Username']
        acc[author] = (acc[author] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const data = Object.entries(contributorCounts)
      .map(([name, value]) => ({
        name,
        value
      }))
      .sort((a, b) => b.value - a.value)

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

  getReleaseTypeData(): ReleaseTypeData[] {
    const typesByRepo = this.releases.reduce(
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
      {} as Record<string, ReleaseTypeData>
    )

    return Object.values(typesByRepo)
  }

  getWordCloudData(): WordCloudData[] {
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

    const allText = this.releases
      .map(release => release.Description || '')
      .join(' ')
      .toLowerCase()

    const words = allText
      .replace(/[^a-zA-Z\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word) && !/^\d+$/.test(word))

    const wordFreq = words.reduce(
      (acc, word) => {
        acc[word] = (acc[word] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return Object.entries(wordFreq)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 50)
  }

  getDashboardData(): DashboardData {
    return {
      timeline: this.getTimelineData(),
      calendar: this.getCalendarData(),
      weekday: this.getWeekdayData(),
      timeDistribution: this.getTimeDistributionData(),
      contributors: this.getContributorData(),
      releaseTypes: this.getReleaseTypeData(),
      wordCloud: this.getWordCloudData()
    }
  }
}

export const releaseService = new ReleaseService()
