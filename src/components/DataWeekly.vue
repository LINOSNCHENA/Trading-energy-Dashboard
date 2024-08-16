<template>
  <v-container>
    <div class="header-container">
      <h2>Weekly records of complete datapoints: {{ filteredX }} / {{ counted }}</h2>
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

  interface TimeSeriesDaily {
    [key: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  }

  // Define reactive state
  const minAmount = ref<number | null>(null)
  const maxAmount = ref<number | null>(null)
  const counted = ref(0)
  const filteredX = ref(0)
  const originalData = ref<{ date: string; amount: number }[]>([])

  // Computed properties to calculate min and max values from originalData
  const calculatedMaxAmount = computed(() => {
    const amounts = originalData.value.map(item => item.amount)
    return amounts.length > 0 ? Math.max(...amounts) : null
  })

  const calculatedMinAmount = computed(() => {
    const amounts = originalData.value.map(item => item.amount)
    return amounts.length > 0 ? Math.min(...amounts) : null
  })

  // Filter the data based on the min and max values
  const filteredData = computed(() => {
    const min = minAmount.value ?? calculatedMinAmount.value ?? 0
    const max = maxAmount.value ?? calculatedMaxAmount.value ?? Infinity
    return originalData.value.filter(d => d.amount >= min && d.amount <= max)
  })

  const drawChart = () => {
    const svgElement = d3.select<SVGSVGElement, unknown>('svg')
    const svgContainer = svgElement.node()?.parentNode as HTMLElement
    const containerWidth = svgContainer?.clientWidth || 800
    const containerHeight = Math.min(svgContainer?.clientHeight || 500, window.innerHeight * 0.75) // Limit height to 75% of viewport height

    const data = filteredData.value
    filteredX.value = data.length

    if (data.length === 0) return

    const parseTime = d3.timeParse('%Y-%m-%d')
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => parseTime(d.date) as Date) as [Date, Date])
      .range([0, containerWidth - 80])

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.amount) as number])
      .nice()
      .range([containerHeight - 60, 0])

    const line = d3.line<{ date: string; amount: number }>()
      .x(d => x(parseTime(d.date) as Date))
      .y(d => y(d.amount))

    svgElement
      .attr('width', containerWidth)
      .attr('height', containerHeight)

    svgElement.selectAll('*').remove()

    const g = svgElement.append('g')
      .attr('transform', `translate(40,20)`)

    const xAxis = g.append('g')
      .attr('transform', `translate(0,${containerHeight - 60})`)
      .call(d3.axisBottom(x).tickFormat(d => d3.timeFormat('%b-%y')(d as Date)))

    const yAxis = g.append('g')
      .call(d3.axisLeft(y))

    const path = g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', line)

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [containerWidth, containerHeight]])
      .extent([[0, 0], [containerWidth, containerHeight]])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        const newX = event.transform.rescaleX(x)
        const newY = event.transform.rescaleY(y)

        xAxis.call(d3.axisBottom(newX).tickFormat(d => d3.timeFormat('%b-%y')(d as Date)))
        yAxis.call(d3.axisLeft(newY))

        path.attr('d', line.x(d => newX(parseTime(d.date) as Date))
          .y(d => newY(d.amount)))
      })

    svgElement.call(zoom as unknown as d3.ZoomBehavior<SVGSVGElement, unknown>)
  }

  // Watch for changes in minAmount and maxAmount and update the chart accordingly
  watch([minAmount, maxAmount], () => {
    drawChart()
  })

  onMounted(async () => {
    try {
      const data = await EnergyServices.getDailyData()
      if (data && typeof data === 'object' && 'Time Series (Daily)' in data) {
        const timeSeriesData = data['Time Series (Daily)'] as TimeSeriesDaily
        const filteredDataPoints = Object.values(timeSeriesData).map(entry =>
          parseFloat(entry['4. close'])
        ).reverse()
        const labels = Object.keys(timeSeriesData).reverse()

        originalData.value = labels.map((date, index) => ({
          date,
          amount: filteredDataPoints[index],
        }))
        counted.value = originalData.value.length

        // Initialize minAmount and maxAmount with computed values
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
}

.filter-row {
  margin-bottom: 1em;
  overflow: visible;
  flex-direction: row;
  width: 100%;
  max-height: 15vh;
  background: green;
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
  padding: 0;
}

.responsive-text-field {
  width: 100%;
  max-width: 30%;
}

@media (max-width: 600px) {
  .filter-row {
    flex-direction: row;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5em;
  }

  .responsive-text-field {
    margin-bottom: 1em;
  }

  .responsive-btn {
    width: 100%;
  }
}

@media (min-width: 600px) {
  .filter-row {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5em;
  }

  .responsive-text-field {
    max-width: 100%;
    background: pink;
  }
}

@media (min-width: 960px) {
  .filter-row {
    flex-direction: row;
  }

  .responsive-text-field {
    max-width: 100%;
    background: pink;
  }
  .chart-card {
  margin: 0;
  padding: 0;
  flex-grow: 1;
}
  .responsive-btn {
    width: auto;
    max-width: 400px;
  }

  svg {
    border: 3px solid green;
    width: 100%;
    max-height: 90vh;
    height: auto;
  }
}
</style>
