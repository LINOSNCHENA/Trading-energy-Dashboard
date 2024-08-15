<template>
  <v-container>
    <h2>Monthlly data in Line Chart with data filter({{ filteredX }}) / ({{ counted }})</h2>

    <v-row align="center" justify="space-between">
      <v-col cols="4">
        <v-text-field
          v-model.number="minAmount"
          label="Min Amount"
          placeholder="Enter min amount"
          type="number"
        />
      </v-col>
      <v-col cols="4">
        <v-text-field
          v-model.number="maxAmount"
          label="Max Amount"
          placeholder="Enter max amount"
          type="number"
        />
      </v-col>
      <v-col cols="4">
        <v-btn color="primary" @click="updateChart">Apply Filter</v-btn>
      </v-col>
    </v-row>

    <v-card>
      <v-card-text>
        <svg ref="chart" />
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
  const width = 800
  const height = 500
  const minAmount = ref(0)
  const maxAmount = ref(9999)
  const counted = ref(0)
  const filteredX = ref(0)
  const originalData = ref<{ date: string; amount: number }[]>([])

  // Compute filtered data based on min and max amount
  const filteredData = computed(() => {
    const min = isNaN(minAmount.value) ? 0 : minAmount.value
    const max = isNaN(maxAmount.value) ? Infinity : maxAmount.value
    return originalData.value.filter(d => d.amount >= min && d.amount <= max)
  })

  // Draw the chart with zoom and pan functionality on both x-axis and y-axis
  const drawChart = () => {
    const data = filteredData.value
    filteredX.value = data.length

    if (data.length === 0) return

    // Parse the dates
    const parseTime = d3.timeParse('%Y-%m-%d')

    // Create scales
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => parseTime(d.date) as Date) as [Date, Date])
      .range([0, width])

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.amount) as number])
      .nice()
      .range([height, 0])

    // Create line generator
    const line = d3.line<{ date: string; amount: number }>()
      .x(d => x(parseTime(d.date) as Date))
      .y(d => y(d.amount))

    // Select and configure the SVG
    const svg = d3.select<SVGSVGElement, unknown>('svg')
      .attr('width', width)
      .attr('height', height)

    // Clear previous content
    svg.selectAll('*').remove()

    // Create a group for the chart elements
    const g = svg.append('g')
      .attr('transform', `translate(50,20)`)

    // Add x-axis with month and year format
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${height - 40})`)
      .call(d3.axisBottom(x).tickFormat(d => d3.timeFormat('%b-%y')(d as Date)))

    // Add y-axis
    const yAxis = g.append('g')
      .call(d3.axisLeft(y))

    // Add the line path
    const path = g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', line)

    // Define zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 10]) // Define the zoom scale range
      .translateExtent([[0, 0], [width, height]]) // Define the translate boundaries
      .extent([[0, 0], [width, height]])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        // Rescale x and y axes
        const newX = event.transform.rescaleX(x)
        const newY = event.transform.rescaleY(y)

        // Update axes
        xAxis.call(d3.axisBottom(newX).tickFormat(d => d3.timeFormat('%b-%y')(d as Date)))
        yAxis.call(d3.axisLeft(newY))

        // Update line path
        path.attr('d', line.x(d => newX(parseTime(d.date) as Date))
          .y(d => newY(d.amount)))
      })

    // Apply zoom to SVG
    svg.call(zoom as unknown as d3.ZoomBehavior<SVGSVGElement, unknown>)
  }

  // Update chart when filter is applied
  const updateChart = () => {
    drawChart()
  }

  // Automatically update the chart when minAmount or maxAmount changes
  watch([minAmount, maxAmount], () => {
    updateChart()
  })

  // Fetch data and draw the chart initially
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
v-container {
  background-color: teal;
  color: white; /* Optional: ensure text is readable on teal background */
  height: 100vh;
  width: 100vw;
  overflow: hidden; /* Prevent scrollbars if content overflows */
}

v-card {
  margin-top: 20px;
}

svg {
  border: 1px solid #ccc;
  height: 100%;
  width: 100%;
}
</style>
