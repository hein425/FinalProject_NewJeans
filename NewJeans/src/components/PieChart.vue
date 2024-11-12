<template>
  <div>
    <h2>카테고리 통계</h2>
    <canvas id="myPieChart"></canvas>
  </div>
</template>

<script>
import { PieController, ArcElement, Tooltip, Legend, Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import axios from 'axios';
import { BASE_URL } from '@/config';
import { useAuthStore } from '@/stores/authStore';

Chart.register(PieController, ArcElement, Tooltip, Legend, ChartDataLabels);

export default {
  data() {
    return {
      // 카테고리 순서를 DAILY, GROWTH, TRIP, EXERCISE, ETC로 설정
      categoryLabels: ['DAILY', 'GROWTH', 'TRIP', 'EXERCISE', 'ETC'],
      categoryData: [],
      colors: {
        DAILY: '#FF6384',
        GROWTH: '#36A2EB',
        TRIP: '#FFCE56',
        EXERCISE: '#4BC0C0',
        ETC: '#9966FF',
      },
    };
  },
  async mounted() {
    try {
      const authStore = useAuthStore();
      const userIdx = authStore.idx; // 적절한 userIdx 설정
      const response = await axios.get(`${BASE_URL}/statistics/category?userIdx=${userIdx}`);
      console.log('Response Data:', response.data);

      const statisticsList = Array.isArray(response.data) ? response.data : [];
      this.processData(statisticsList);

      const ctx = document.getElementById('myPieChart').getContext('2d');
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: this.categoryLabels,
          datasets: [
            {
              label: 'Category Statistics',
              data: this.categoryData,
              backgroundColor: [this.colors.DAILY, this.colors.GROWTH, this.colors.TRIP, this.colors.EXERCISE, this.colors.ETC],
            },
          ],
        },
        options: {
          plugins: {
            datalabels: {
              color: '#fff',
              formatter: (value, context) => {
                const label = context.chart.data.labels[context.dataIndex];
                return `${label}\n${value.toFixed(1)}%`; // 소수점 첫째 자리까지 표시
              },
              font: {
                weight: 'bold',
                size: 12,
              },
              anchor: 'end', // 레이블 위치 조정
              align: 'start', // 레이블 위치 조정
            },
            legend: {
              display: true,
              position: 'bottom', // 범례 위치 설정
            },
          },
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    } catch (error) {
      console.error('Failed to fetch category statistics:', error);
    }
  },
  methods: {
    processData(statisticsList) {
      if (Array.isArray(statisticsList)) {
        this.categoryData = this.categoryLabels.map(label => {
          const categoryStat = statisticsList.find(stat => stat.category === label);
          return categoryStat ? categoryStat.percentage : 0;
        });
      } else {
        console.error('Invalid data structure received:', statisticsList);
      }
    },
  },
};
</script>

<style scoped>
canvas {
  max-width: 300px;
  max-height: 300px;
}
h2 {
  position: relative;
  right: 258px;
}
</style>
