<template>
  <v-container>
    <div class="header-container">
      <h2>Line of Maximum of complete datapoints: {{ filteredX }} / {{ counted }}</h2>
    </div>
    <v-row align="center" class="filter-row" justify="space-evenly" no-gutters>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model.number="minAmount"
          aria-label="Minimum Price"
          class="responsive-text-field"
          label="Minimum Price"
          placeholder="Enter minimum price"
          type="number"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model.number="maxAmount"
          aria-label="Maximum Price"
          class="responsive-text-field"
          label="Maximum Price"
          placeholder="Enter maximum price"
          type="number"
        />
      </v-col>
    </v-row>

    <v-card class="chart-card">
      <v-card-text>
        <svg ref="chart" aria-label="Line Chart" />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import * as d3 from 'd3'
  import EnergyServices from '@/services/EnergyServices'
  import { IDataPoint, ITimeSeriesDaily } from '@/types/types'

  const minAmount = ref<number | null>(null)
  const maxAmount = ref<number | null>(null)
  const counted = ref(0)
  const filteredX = ref(0)
  const originalData = ref<IDataPoint[]>([])
  const currentYear = new Date().getFullYear()

  const filteredData = computed(() => {
    const min = minAmount.value ?? 0
    const max = maxAmount.value ?? Infinity
    return originalData.value.filter(d => d.price >= min && d.price <= max)
  })

  const calculatedMaxAmount = computed(() => {
    const amounts = originalData.value.map(item => item.price)
    return amounts.length > 0 ? Math.max(...amounts) : null
  })

  const calculatedMinAmount = computed(() => {
    const amounts = originalData.value.map(item => item.price)
    return amounts.length > 0 ? Math.min(...amounts) : null
  })

  function getDayMonth (date: string): string {
    const currentDate = new Date(date)
    const day = String(currentDate.getDate()).padStart(2, '0')
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    return `${month}-${day}`
  }

  function calculateCurrentYearData (data: { date: string; price: number }[]): { date: string; price: number }[] {
    return data.filter(entry => new Date(entry.date).getFullYear() === currentYear)
  }

  function drawChart () {
    const svgElement = d3.select<SVGSVGElement, unknown>('svg')
    const svgContainer = svgElement.node()?.parentNode as HTMLElement
    const containerWidth = svgContainer?.clientWidth || 800
    const containerHeight = Math.min(svgContainer?.clientHeight || 500, window.innerHeight * 0.75)
    const allData = filteredData.value
    const currentYearDataPoints = calculateCurrentYearData(allData)

    if (currentYearDataPoints.length === 0) return
    filteredX.value = currentYearDataPoints.length

    const parseDate = d3.timeParse('%m-%d')
    const formatDate = d3.timeFormat('%b-%d')

    const x = d3.scaleTime()
      .domain(d3.extent(currentYearDataPoints, d => parseDate(getDayMonth(d.date)) as Date) as [Date, Date])
      .range([0, containerWidth - 80])

    const y = d3.scaleLinear()
      .domain([0, d3.max(currentYearDataPoints, d => d.price) as number])
      .nice()
      .range([containerHeight - 60, 0])

    const line = d3.line<{ date: string; price: number }>()
      .x(d => x(parseDate(getDayMonth(d.date)) as Date))
      .y(d => y(d.price))

    svgElement
      .attr('width', containerWidth)
      .attr('height', containerHeight)

    svgElement.selectAll('*').remove()

    const g = svgElement.append('g')
      .attr('transform', `translate(40,20)`)

    const xAxis = g.append('g')
      .attr('transform', `translate(0,${containerHeight - 60})`)
      .call(d3.axisBottom(x).tickFormat(d => formatDate(d as Date)))

    const yAxis = g.append('g')
      .call(d3.axisLeft(y))

    g.append('path')
      .datum(currentYearDataPoints)
      .attr('fill', 'none')
      .attr('stroke', 'red')
      .attr('stroke-width', 1.5)
      .attr('d', line)

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [containerWidth, containerHeight]])
      .extent([[0, 0], [containerWidth, containerHeight]])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        const newX = event.transform.rescaleX(x)
        const newY = event.transform.rescaleY(y)

        xAxis.call(d3.axisBottom(newX).tickFormat(d => formatDate(d as Date)))
        yAxis.call(d3.axisLeft(newY))

        g.selectAll('path')
          .attr('d', d => {
            return line.x(d => newX(parseDate(getDayMonth(d.date)) as Date))
              .y(d => newY(d.price))(d as any)
          })
      })

    svgElement.call(zoom)
  }

  watch([minAmount, maxAmount], () => {
    drawChart()
  })

  onMounted(async () => {
    try {
      const data = await EnergyServices.getDailyData()
      if (data && typeof data === 'object' && 'Time Series (Daily)' in data) {
        const timeSeriesData = data['Time Series (Daily)'] as ITimeSeriesDaily
        const filteredDataPoints = Object.values(timeSeriesData).map(entry =>
          parseFloat(entry['4. close'])
        ).reverse()
        const labels = Object.keys(timeSeriesData).reverse()

        originalData.value = labels.map((date, index) => ({
          date,
          price: filteredDataPoints[index],
          current: 0,
          difference: 0,
        }))
        counted.value = originalData.value.length
        minAmount.value = calculatedMinAmount.value
        maxAmount.value = calculatedMaxAmount.value

        drawChart()
      } else {
        console.error('No valid data found.')
      }
    } catch (error) {
      console.error('An error occurred while fetching the JSON data:', error)
    }
  })
</script>

<style scoped>
.header-container h2 {
  text-align: center;
  font-size: small;
  text-transform: uppercase;
  margin: auto;
}

.filter-row {
  margin-bottom: 1em;
  margin: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 0.1em;
}

.chart-card {
  margin: 0;
  padding: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: greenyellow;
  background: gainsboro;
  color: black;
  min-height: 60vh;
  max-height: 80vh;
}

.chart-card svg {
  width: 100%;
  /* Make SVG fill the width of the card */
  height: 100%;
  /* Make SVG fill the height of the card */
  display: block;
  font-size: small;
  text-transform: uppercase;
}

.responsive-text-field {
  width: 100%;
}

@media (max-width: 600px) {
  .filter-row {
    flex-direction: column;
  }

  .responsive-text-field {
    margin-bottom: 1em;
  }
}

@media (min-width: 600px) {
  .filter-row {
    flex-direction: row;
  }

}
</style>
