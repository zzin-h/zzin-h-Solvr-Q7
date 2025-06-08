interface WordCloudChartProps {
  data: {
    text: string
    value: number
  }[]
}

export function WordCloudChart({ data }: WordCloudChartProps) {
  // 최대 글자 크기와 최소 글자 크기 설정
  const maxFontSize = 48
  const minFontSize = 12

  // 최대값과 최소값 찾기
  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))

  // 글자 크기 계산 함수
  const calculateFontSize = (value: number) => {
    if (maxValue === minValue) return minFontSize
    return ((value - minValue) / (maxValue - minValue)) * (maxFontSize - minFontSize) + minFontSize
  }

  return (
    <div className="w-full h-full overflow-hidden flex flex-wrap justify-center items-center gap-4 p-4">
      {data.map((item, index) => {
        const fontSize = calculateFontSize(item.value)
        const opacity = 0.3 + (item.value / maxValue) * 0.7 // 빈도에 따른 투명도

        return (
          <div
            key={index}
            className="inline-block cursor-pointer transition-all duration-200 hover:scale-110"
            style={{
              fontSize: `${fontSize}px`,
              opacity,
              color: `hsl(${(index * 37) % 360}, 70%, 50%)` // 다양한 색상 생성
            }}
            title={`${item.text}: ${item.value}회`}
          >
            {item.text}
          </div>
        )
      })}
    </div>
  )
}
