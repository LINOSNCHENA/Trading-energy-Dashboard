<template>
  <v-container>
    <div class="header-container">
      <h2>Balance: Maximum vs Minimum in Line Chart | Data Filter: {{ filteredX }} / {{ counted }}</h2>
    </div>

    <v-row align="center" class="filter-row" justify="space-evenly">
      <v-col cols="12" sm="4">
        <v-text-field
          v-model.number="minAmount"
          aria-label="Minimum Price"
          class="responsive-text-field"
          label="Minimum Price"
          placeholder="Enter minimum price"
          type="number"
          @change="drawChart()"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model.number="maxAmount"
          aria-label="Maximum Price"
          bg-color="teal"
          class="responsive-text-field"
          label="Maximum Price"
          placeholder="Enter maximum price"
          type="number"
          @change="drawChart()"
        />
      </v-col>
    </v-row>

    <v-card>
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
  // const minAmount = ref(0)
  const counted = ref(0)
  const filteredX = ref(0)
  const originalData = ref<{ date: string; amount: number }[]>([])

  // Compute the maximum amount whenever originalData changes
  const maxAmount = computed(() => {
    const amounts = originalData.value.map(item => item.amount)
    return amounts.length > 0 ? Math.max(...amounts) : 0
  })

  const minAmount = computed(() => {
    const amounts = originalData.value.map(item => item.amount)
    return amounts.length > 0 ? Math.min(...amounts) : 0
  })

  const filteredData = computed(() => {
    const min = isNaN(minAmount.value) ? 0 : minAmount.value
    const max = isNaN(maxAmount.value) ? Infinity : maxAmount.value
    return originalData.value.filter(d => d.amount >= min && d.amount <= max)
  })

  // Draw the chart with zoom and pan functionality on both x-axis and y-axis
  const drawChart = () => {
    const svgElement = d3.select<SVGSVGElement, unknown>('svg')
    const svgContainer = svgElement.node()?.parentNode as HTMLElement
    const containerWidth = svgContainer?.clientWidth || 800 // Default width
    const containerHeight = svgContainer?.clientHeight || 500 // Default height

    const data = filteredData.value
    filteredX.value = data.length

    if (data.length === 0) return

    const parseTime = d3.timeParse('%Y-%m-%d')
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => parseTime(d.date) as Date) as [Date, Date])
      .range([0, containerWidth - 80]) // Leave space for margins

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.amount) as number])
      .nice()
      .range([containerHeight - 60, 0]) // Leave space for margins

    // Create line generator
    const line = d3.line<{ date: string; amount: number }>()
      .x(d => x(parseTime(d.date) as Date))
      .y(d => y(d.amount))

    // Set SVG dimensions dynamically
    svgElement
      .attr('width', containerWidth)
      .attr('height', containerHeight)

    // Clear previous content
    svgElement.selectAll('*').remove()

    // Create a group for the chart elements
    const g = svgElement.append('g')
      .attr('transform', `translate(40,20)`) // Margins

    // Add x-axis with month and year format
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${containerHeight - 60})`) // Bottom margin
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

  const updateChart = () => {
    drawChart()
  }

  watch([minAmount, maxAmount], () => {
    updateChart()
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

        drawChart()
      } else {
        console.error('No valid data found.')
      }
    } catch (error) {
      console.error('An error occurred while fetching the JSON data:', error)
    }
  })
</script>

<!-- <style scoped>
v-container {
  background-color: yellowgreen;
  color: white;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.filter-row {
  width: 100%;
  border: 3px solid rgb(0, 255, 179);
  margin: auto;
  box-sizing: border-box;
  max-height: 10vh;
  padding: auto;
  overflow: visible; /* Ensures no hidden content */
}
.responsive-text-field {
  width: 100%; /* Full width within its column */
  max-width: 300px; /* Maximum width */
}

.chart-card {
  margin-top: 20px;
  border: 3px solid yellow;
  width: 100%;
  height: 100%; /* Full height of container */
  min-height: 55vh;
}

svg {
  border: 3px solid red;
  width: 100%;
  min-height: 75vh;
  height: 100%; /* Full height of container */
  display: block; /* Remove inline-block spacing issues */
}

@media (min-width: 600px) {
  .responsive-text-field {
    width: 100%; /* Ensure it takes full width of its column */
    max-width: 100px; /* Adjust max width for larger screens */
  }
}

@media (min-width: 960px) {
  .responsive-text-field {
    max-width: 100px; /* Adjust max width for even larger screens */
  }
}

.responsive-btn {
  width: 100%;
  max-width: 100px; /* Adjust max width for button */
  height: 60px;
  margin: auto;
}
</style> -->

<style scoped>
.header-container h2 {
  text-align: center;
}

.filter-row {
  margin-bottom: 1em;
  /* Ensure no overflow and proper alignment */
  overflow: visible;
  /* Ensures no hidden content */
  flex-direction: row;

}

svg {
  border: 3px solid green;
  width: 100%;
  min-height: 75vh;
  height: 100%;
  /* Full height of container */
  display: block;
  /* Remove inline-block spacing issues */
}

.responsive-text-field {
  width: 100%;
  /* Full width within its column */
  max-width: 30%;
  /* Ensures it doesn't exceed column width */
}

@media (max-width: 600px) {
  .filter-row {
    flex-direction: row;
    /* Stack vertically on small screens */
  }

  .responsive-text-field {
    margin-bottom: 1em;
    /* Space between text fields and button */
  }

  .responsive-btn {
    width: 100%;
    /* Full width on small screens */
  }
}

@media (min-width: 600px) {
  .filter-row {
    flex-direction: row;
    /* Row layout for larger screens */
    flex-wrap: wrap;
    /* Allows wrapping if necessary */
    display: flex;
    flex-direction: row;
    /* Stack items vertically */
    gap: 1em;
    /* Space between items */
  }

  svg {
    border: 3px solid yellow;
    width: 100%;
    min-height: 75vh;
    height: 100%;
    /* Full height of container */
    display: block;
    /* Remove inline-block spacing issues */
  }

  .responsive-text-field {
    max-width: 100%;
    /* Ensure text field doesn't exceed column width */
    background: pink;
  }
}

@media (min-width: 960px) {
  .filter-row {
    flex-direction: row;
    /* Ensures vertical stacking on larger screens as well */
  }

  .responsive-text-field {
    max-width: 100%;
    /* Ensures responsiveness on larger screens */
    background: pink;
  }

  svg {
    border: 6px solid blueviolet;
    width: 100%;
    min-height: 75vh;
    height: 100%;
    /* Full height of container */
    display: block;
    /* Remove inline-block spacing issues */
    margin: auto;
    padding: auto;
  }

  .responsive-btn {
    width: auto;
    /* Auto width for larger screens */
    max-width: 400px;
    /* Maximum width for button */
  }
}
</style>
