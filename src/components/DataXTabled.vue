<template>
  <v-container>
    <div class="header-container">
      <h2>Data Tables of complete datapoints: {{ filteredX }} / {{ counted }}| Stored ({{ storedData }})</h2>
    </div>
    <v-row>
      <v-col cols="6">
        <!-- <v-pre>{{ filteredData[0] }}</v-pre> -->
        <v-card class="data-table-card">
          <v-card-title>Prices Data - Original Table ({{ filteredData.length }})</v-card-title>
          <table class="custom-data-table">
            <thead>
              <tr>
                <th>Index</th>
                <th>Date</th>
                <th>Price</th>
                <th>Min Price</th>
                <th>Max Price</th>
                <th>Global Diff</th>
                <th>Current</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in sortedFilteredData" :key="item.date">
                <td>{{ index + 1 }}</td>
                <td>{{ item.date }}</td>
                <td>{{ item.price }}</td>
                <td>{{ calculatedMinAmount }}</td>
                <td>{{ calculatedMaxAmount }}</td>
                <td>{{ (calculatedMaxAmount ?? 0) - (calculatedMinAmount ?? 0) }}</td>
                <td>{{ item.current }}</td>
              </tr>
            </tbody>
          </table>
        </v-card>
      </v-col>

      <v-col cols="6">
        <v-card class="data-table-card">
          <v-card-title>Prices Data - Process Table ({{ processedData.length }})</v-card-title>
          <table class="custom-data-table">
            <thead>
              <tr>
                <th>Index</th>
                <th>Date</th>
                <th>Price</th>
                <th>Min Price</th>
                <th>Max Price</th>
                <th>Difference</th>
                <th>Current</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in sortedProcessedData" :key="item.date">
                <td>{{ index + 1 }}</td>
                <td>{{ item.date }}</td>
                <td>{{ item.price }}</td>
                <td>{{ item.min }}</td>
                <td>{{ item.max }}</td>
                <td>{{ item.difference }}</td>
                <td>{{ item.current }}</td>
              </tr>
            </tbody>
          </table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import * as d3 from 'd3'
  import EnergyServices from '@/services/EnergyServices'
  import { IDataPoint, ITimeSeriesDaily } from '@/types/types'
  import { useAuthStore } from '@/stores/AppsAuth'
  import { maximumMinimumPices } from '@/utils/computedMaximumGap'
  import { getRawData } from '@/utils/computedWholeData'

  const minAmount = ref<number | null>(null)
  const maxAmount = ref<number | null>(null)
  const originalData = ref<IDataPoint[]>([])
  const processedData = ref<IDataPoint[]>([])
  const currentYear = new Date().getFullYear()
  const storeAUT = useAuthStore()
  const storedData = ref(0)
  const counted = ref(0)
  const filteredX = ref(0)

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

  const sortedFilteredData = computed(() => {
    return filteredData.value.slice().sort((b, a) => (a.price) - (b.price))
  })

  const sortedProcessedData = computed(() => {
    return processedData.value.slice().sort((b, a) => (a.price) - (b.price))
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
        const dataProcessing = maximumMinimumPices(timeSeriesData)
        processedData.value = dataProcessing
        const rawData = getRawData(timeSeriesData)
        originalData.value = rawData

        //    await storeAUT.fetchData()
        storedData.value = storeAUT.loadedRecords
        counted.value = originalData.value.length
        filteredX.value = sortedProcessedData.value.length

        console.log(originalData.value[0])
        console.log(processedData.value[0])
        console.log(sortedProcessedData.value[0])

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
  max-height: 10vh;
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

.custom-data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1em;
}

.custom-data-table th,
.custom-data-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
}

.custom-data-table th {
  background-color: #f5f5f5;
  font-weight: bold;
  background: teal;
}

.responsive-text-field {
  width: 100%;
}

.center-text {
  text-align: center;
}

@media (max-width: 600px) {
  .filter-row {
    flex-direction: column;
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

@media (min-width: 600px) and (max-width: 960px) {
  .filter-row {
    flex-direction: row;
    gap: 0.5em;
  }

  .responsive-text-field {
    max-width: 30%;
    background: pink;
  }
}

@media (min-width: 960px) {
  .filter-row {
    flex-direction: row;
  }

  .responsive-text-field {
    max-width: 30%;
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
