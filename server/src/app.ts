import express from 'express'
import cors from 'cors'
import { releaseService } from './services/releaseService'
import dashboardRoutes from './routes/dashboardRoutes'

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// API 라우트
app.use('/api', dashboardRoutes)

// 서버 시작
async function startServer() {
  try {
    // 데이터 로드
    await releaseService.loadData()

    app.listen(port, () => {
      console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`)
    })
  } catch (error) {
    console.error('서버 시작 실패:', error)
    process.exit(1)
  }
}

startServer()
