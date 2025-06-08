import { Octokit } from '@octokit/rest'
import { createObjectCsvWriter } from 'csv-writer'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import isoWeek from 'dayjs/plugin/isoWeek'
import {
  ReleaseSchema,
  type Release,
  type ReleaseStats,
  type StatRecord,
  type RawReleaseRecord
} from './types'

dayjs.extend(weekOfYear)
dayjs.extend(isoWeek)

const REPOS = [
  { owner: 'daangn', repo: 'stackflow' },
  { owner: 'daangn', repo: 'seed-design' }
]

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

function isWeekday(date: string | null): boolean {
  if (!date) return false // null인 경우 제외
  const day = dayjs(date)
  const weekday = day.isoWeekday()
  return weekday >= 1 && weekday <= 5 // 1(월) ~ 5(금)만 true
}

async function fetchAllReleases(owner: string, repo: string): Promise<Release[]> {
  const releases = []
  let page = 1

  while (true) {
    const response = await octokit.repos.listReleases({
      owner,
      repo,
      per_page: 100,
      page
    })

    if (response.data.length === 0) break

    const validReleases = response.data
      .filter(release => isWeekday(release.published_at)) // 주말 릴리스 제외
      .map(release => ({
        ...release,
        repository: repo
      }))
      .map(release => ReleaseSchema.parse(release))

    releases.push(...validReleases)
    page++
  }

  return releases
}

function calculateStats(releases: Release[]): ReleaseStats {
  const stats: ReleaseStats = {
    repository: releases[0]?.repository || '',
    totalReleases: releases.length,
    yearlyStats: {},
    monthlyStats: {},
    weeklyStats: {},
    authorStats: {}
  }

  releases.forEach(release => {
    const date = dayjs(release.published_at)
    const year = date.format('YYYY')
    const month = date.format('YYYY-MM')
    const week = `${date.format('YYYY')}-W${date.week()}`
    const author = release.author.login

    stats.yearlyStats[year] = (stats.yearlyStats[year] || 0) + 1
    stats.monthlyStats[month] = (stats.monthlyStats[month] || 0) + 1
    stats.weeklyStats[week] = (stats.weeklyStats[week] || 0) + 1
    stats.authorStats[author] = (stats.authorStats[author] || 0) + 1
  })

  return stats
}

async function writeStatsToCsv(allStats: ReleaseStats[]) {
  const csvWriter = createObjectCsvWriter({
    path: 'release-stats.csv',
    header: [
      { id: 'repository', title: 'Repository' },
      { id: 'metric', title: 'Metric' },
      { id: 'period', title: 'Period' },
      { id: 'count', title: 'Count' }
    ]
  })

  const records: StatRecord[] = []

  allStats.forEach(stats => {
    // Total releases
    records.push({
      repository: stats.repository,
      metric: 'Total',
      period: 'All time',
      count: stats.totalReleases
    })

    // Yearly stats
    Object.entries(stats.yearlyStats).forEach(([year, count]) => {
      records.push({
        repository: stats.repository,
        metric: 'Yearly',
        period: year,
        count
      })
    })

    // Monthly stats
    Object.entries(stats.monthlyStats).forEach(([month, count]) => {
      records.push({
        repository: stats.repository,
        metric: 'Monthly',
        period: month,
        count
      })
    })

    // Weekly stats
    Object.entries(stats.weeklyStats).forEach(([week, count]) => {
      records.push({
        repository: stats.repository,
        metric: 'Weekly',
        period: week,
        count
      })
    })

    // Author stats
    Object.entries(stats.authorStats).forEach(([author, count]) => {
      records.push({
        repository: stats.repository,
        metric: 'Author',
        period: author,
        count
      })
    })
  })

  await csvWriter.writeRecords(records)
}

async function writeRawDataToCsv(releases: Release[]) {
  const csvWriter = createObjectCsvWriter({
    path: 'release-raw-data.csv',
    header: [
      { id: 'repository', title: 'Repository' },
      { id: 'releaseId', title: 'Release ID' },
      { id: 'tagName', title: 'Tag Name' },
      { id: 'releaseName', title: 'Release Name' },
      { id: 'publishedAt', title: 'Published At' },
      { id: 'createdAt', title: 'Created At' },
      { id: 'authorUsername', title: 'Author Username' },
      { id: 'isDraft', title: 'Is Draft' },
      { id: 'isPrerelease', title: 'Is Prerelease' },
      { id: 'description', title: 'Description' },
      { id: 'releaseUrl', title: 'Release URL' },
      { id: 'isWeekday', title: 'Is Weekday' },
      { id: 'year', title: 'Year' },
      { id: 'month', title: 'Month' },
      { id: 'week', title: 'Week' },
      { id: 'dayOfWeek', title: 'Day of Week' }
    ]
  })

  const records: RawReleaseRecord[] = releases.map(release => {
    const date = dayjs(release.published_at)
    return {
      repository: release.repository,
      releaseId: release.id,
      tagName: release.tag_name,
      releaseName: release.name,
      publishedAt: release.published_at,
      createdAt: release.created_at,
      authorUsername: release.author.login,
      isDraft: release.draft,
      isPrerelease: release.prerelease,
      description: release.body,
      releaseUrl: release.html_url,
      isWeekday: isWeekday(release.published_at),
      year: date.format('YYYY'),
      month: date.format('YYYY-MM'),
      week: `${date.format('YYYY')}-W${date.week()}`,
      dayOfWeek: date.isoWeekday()
    }
  })

  await csvWriter.writeRecords(records)
}

async function main() {
  try {
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN environment variable is required')
    }

    const allStats: ReleaseStats[] = []
    const allReleases: Release[] = []

    for (const { owner, repo } of REPOS) {
      console.log(`Fetching releases for ${owner}/${repo}...`)
      const releases = await fetchAllReleases(owner, repo)
      allReleases.push(...releases)
      const stats = calculateStats(releases)
      allStats.push(stats)
    }

    await writeStatsToCsv(allStats)
    await writeRawDataToCsv(allReleases)
    console.log('Release statistics have been written to release-stats.csv')
    console.log('Raw release data have been written to release-raw-data.csv')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
