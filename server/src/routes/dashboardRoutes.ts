import { Router } from 'express'
import { releaseService } from '../services/releaseService'

const router = Router()

// 전체 대시보드 데이터
router.get('/dashboard', async (req, res) => {
  try {
    const data = releaseService.getDashboardData()
    res.json(data)
  } catch (error) {
    console.error('대시보드 데이터 조회 실패:', error)
    res.status(500).json({ error: '대시보드 데이터를 가져오는데 실패했습니다.' })
  }
})

// 개별 차트 데이터
router.get('/timeline', (req, res) => {
  try {
    const data = releaseService.getTimelineData()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: '타임라인 데이터를 가져오는데 실패했습니다.' })
  }
})

router.get('/calendar', (req, res) => {
  try {
    const data = releaseService.getCalendarData()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: '캘린더 데이터를 가져오는데 실패했습니다.' })
  }
})

router.get('/weekday', (req, res) => {
  try {
    const data = releaseService.getWeekdayData()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: '요일별 데이터를 가져오는데 실패했습니다.' })
  }
})

router.get('/time-distribution', (req, res) => {
  try {
    const data = releaseService.getTimeDistributionData()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: '시간대별 데이터를 가져오는데 실패했습니다.' })
  }
})

router.get('/contributors', (req, res) => {
  try {
    const data = releaseService.getContributorData()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: '기여자 데이터를 가져오는데 실패했습니다.' })
  }
})

router.get('/release-types', (req, res) => {
  try {
    const data = releaseService.getReleaseTypeData()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: '릴리스 타입 데이터를 가져오는데 실패했습니다.' })
  }
})

router.get('/word-cloud', (req, res) => {
  try {
    const data = releaseService.getWordCloudData()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: '워드 클라우드 데이터를 가져오는데 실패했습니다.' })
  }
})

export default router
