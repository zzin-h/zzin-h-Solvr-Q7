import { Octokit } from '@octokit/rest'
import { createObjectCsvWriter } from 'csv-writer'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { ReleaseSchema, type Release, type ReleaseStats, type StatRecord } from './types'

dayjs.extend(weekOfYear)

const REPOS = [
  { owner: 'daangn', repo: 'stackflow' },
  { owner: 'daangn', repo: 'seed-design' }
]

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

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

async function main() {
  try {
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN environment variable is required')
    }

    const allStats: ReleaseStats[] = []

    for (const { owner, repo } of REPOS) {
      console.log(`Fetching releases for ${owner}/${repo}...`)
      const releases = await fetchAllReleases(owner, repo)
      const stats = calculateStats(releases)
      allStats.push(stats)
    }

    await writeStatsToCsv(allStats)
    console.log('Release statistics have been written to release-stats.csv')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
