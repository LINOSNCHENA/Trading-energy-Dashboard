<template>
  <v-container>
    <div class="header-container">
      <h2>
        Comparison of Min-Max Price Ranges vs 2024 Price Data:
        {{ filteredX }} Filtered Points / {{ counted }} Total Points
      </h2>
    </div>

    <v-row align="center" class="filter-row" justify="space-evenly" no-gutters>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model.number="minAmount"
          aria-label="Set Minimum Price"
          class="responsive-text-field"
          label="Set Minimum Price"
          placeholder="Enter minimum price"
          prepend-icon="mdi-currency-eur"
          type="number"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model.number="maxAmount"
          aria-label="Set Maximum Price"
          class="responsive-text-field"
          label="Set Maximum Price"
          placeholder="Enter maximum price"
          prepend-icon="mdi-currency-eur"
          type="number"
        />
      </v-col>
    </v-row>

    <v-card class="chart-card">
      <v-card-text>
        <svg ref="chart" aria-label="Interactive Price Line Chart" role="img" />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">

  import { computed, onMounted, ref, watch } from 'vue'
  import * as d3 from 'd3'
  import EnergyServices from '@/services/EnergyServices'
  import { DataPoint, IminMaxMap, TimeSeriesDaily } from '@/types/types'

  const minAmount = ref<number | null>(null)
  const maxAmount = ref<number | null>(null)
  const counted = ref<number>(0)
  const filteredX = ref<number>(0)
  const originalData = ref<DataPoint[]>([])

  const filteredData = computed(() => {
    const min = minAmount.value ?? 0
    const max = maxAmount.value ?? Infinity
    return originalData.value.filter(d => d.price >= min && d.price <= max)
  })

  const calculatedMaxAmount = computed(() => {
    const amounts = originalData.value.map(d => d.price)
    return amounts.length > 0 ? Math.max(...amounts) : null
  })

  const calculatedMinAmount = computed(() => {
    const amounts = originalData.value.map(d => d.price)
    return amounts.length > 0 ? Math.min(...amounts) : null
  })

  function getDayMonth (date: string): string {
    const currentDate = new Date(date)
    const day = String(currentDate.getDate()).padStart(2, '0')
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    return `${month}-${day}`
  }

  function drawChart () {
    const svgElement = d3.select<SVGSVGElement, unknown>('svg')
    const svgContainer = svgElement.node()?.parentNode as HTMLElement
    const containerWidth = svgContainer?.clientWidth || 1200
    const containerHeight = Math.min(svgContainer?.clientHeight || 11500, window.innerHeight * 1.75)

    const currentYearDataPoints = filteredData.value
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

    const line = d3.line<DataPoint>()
      .x(d => x(parseDate(getDayMonth(d.date)) as Date))
      .y(d => y(d.price))

    const area = d3.area<DataPoint>()
      .x(d => x(parseDate(getDayMonth(d.date)) as Date))
      .y0(d => y(d.min ?? 0))
      .y1(d => y(d.max ?? 0))

    svgElement
      .attr('width', containerWidth)
      .attr('height', containerHeight)

    svgElement.selectAll('*').remove()

    const g = svgElement.append('g')
      .attr('transform', `translate(40,20)`)

    const areaPath = g.append('path')
      .datum(currentYearDataPoints)
      .attr('class', 'area-plot')
      .attr('fill', 'teal')
      .attr('stroke', 'none')
      .attr('d', area)

    const linePath = g.append('path')
      .datum(currentYearDataPoints)
      .attr('class', 'line-plot')
      .attr('fill', 'none')
      .attr('stroke', 'red')
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round')
      .attr('aria-label', 'Data Line Plot')
      .attr('d', line)

    const tooltip = d3.select('body') // Attach the tooltip to the body instead of the SVG container
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', '#fff')
      .style('border', '1px solid #ccc')
      .style('padding', '5px')
      .style('border-radius', '5px')
      .style('font-size', '12px')
      .style('pointer-events', 'none') // Prevents tooltip from interfering with mouse events

    g.selectAll('circle')
      .data(currentYearDataPoints)
      .enter()
      .append('circle')
      .attr('r', 4)
      .attr('cx', d => x(parseDate(getDayMonth(d.date)) as Date))
      .attr('cy', d => y(d.price))
      .attr('fill', 'red')
      .on('mouseover', function (event, d) {
        d3.select(this).transition().duration(200).attr('r', 6).attr('fill', 'orange') // Highlight on hover
        tooltip.style('visibility', 'visible')
          .html(`
          <strong>Date:</strong> ${d.date}<br>
          <strong>Price:</strong> $${d.price}<br>
          <strong>Min:</strong> $${d.min}<br>
          <strong>Max:</strong> $${d.max}
        `)
      })
      .on('mousemove', function (event) {
        const [tooltipWidth, tooltipHeight] = [tooltip.node()?.clientWidth || 0, tooltip.node()?.clientHeight || 0]
        const xPos = event.pageX + 10 + tooltipWidth > window.innerWidth
          ? event.pageX - tooltipWidth - 10
          : event.pageX + 10
        const yPos = event.pageY + 10 + tooltipHeight > window.innerHeight
          ? event.pageY - tooltipHeight - 10
          : event.pageY + 10
        tooltip.style('top', `${yPos}px`).style('left', `${xPos}px`)
      })
      .on('mouseout', function () {
        d3.select(this).transition().duration(200).attr('r', 4).attr('fill', 'red') // Revert circle style
        tooltip.style('visibility', 'hidden')
      })

    // Add the axes last so they stay on top
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${containerHeight - 60})`)
      .call(d3.axisBottom(x).tickFormat(d => formatDate(d as Date)))

    const yAxis = g.append('g')
      .call(d3.axisLeft(y))

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [containerWidth, containerHeight]])
      .extent([[0, 0], [containerWidth, containerHeight]])
      .translateExtent([[Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY], [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]])
      .extent([[0, 0], [containerWidth, containerHeight]])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        const transform = event.transform
        const newX = transform.rescaleX(x)
        const newY = transform.rescaleY(y)

        xAxis.call(d3.axisBottom(newX).tickFormat(d => formatDate(d as Date)))
        yAxis.call(d3.axisLeft(newY))

        linePath.attr('d', line.x(d => newX(parseDate(getDayMonth(d.date)) as Date)).y(d => newY(d.price)))
        areaPath.attr('d', area.x(d => newX(parseDate(getDayMonth(d.date)) as Date)).y0(d => newY(d.min ?? 0)).y1(d => newY(d.max ?? 0)))

        g.selectAll('circle')
          .attr('cx', d => newX(parseDate(getDayMonth((d as DataPoint).date)) as Date))
          .attr('cy', d => newY((d as DataPoint).price))
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
        const timeSeriesData = data['Time Series (Daily)'] as TimeSeriesDaily
        const processedData = processEnergyData(timeSeriesData)
        originalData.value = processedData
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

  function getMonthDay (dateString: string): string {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${month}-${day}`
  }

  function processEnergyData (data: { [key: string]: { '4. close': string } }): DataPoint[] {
    const monthlyGroups: { [key: string]: number[] } = {}
    const currentYearData: DataPoint[] = []

    Object.entries(data).forEach(([date, { '4. close': close }]) => {
      const price = parseFloat(close)
      const monthDay = getMonthDay(date)
      if (!monthlyGroups[monthDay]) {
        monthlyGroups[monthDay] = []
      }
      monthlyGroups[monthDay].push(price)
      if (new Date(date).getFullYear() === new Date().getFullYear()) {
        currentYearData.push({
          date,
          price,
          current: 0,
        })
      }
    })

    const minMaxMapResult = Object.entries(monthlyGroups).reduce((map, [monthDay, values]) => {
      const minValue = Math.min(...values)
      const maxValue = Math.max(...values)
      const difValue = Number((maxValue - minValue).toFixed(2))
      map[monthDay] = { min: minValue, max: maxValue, current: 2024, difference: difValue, price: difValue }
      return map
    }, {} as IminMaxMap)

    return currentYearData.map(({ date }) => {
      const monthDay = getMonthDay(date)
      const minMax = minMaxMapResult[monthDay] || { min: null, max: null, current: null, difference: null }
      return { date, ...minMax }
    })
  }
</script>

<style scoped>
.header-container h2 {
  text-align: center;
  font-size: small;
  text-transform: uppercase;
}

.filter-row {
  margin-bottom: 1em;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
}

.chart-card {
  margin: 0;
  padding: 0;
  flex-grow: 1;
}

svg {
  border: 3px solid green;
  width: 100%;
  min-height: 60vh;
  max-height: 90vh;
  height: auto;
  display: block;
  margin: auto;
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
