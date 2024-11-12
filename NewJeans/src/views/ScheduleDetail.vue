<template>
    <div v-if="selectedSchedule" class="schedule-detail">
      <h2>{{ selectedSchedule.title }}</h2>
      <p><strong>날짜:</strong> {{ selectedSchedule.date }}</p>
      <p><strong>시작 시간:</strong> {{ formatDateTime(selectedSchedule.start) }}</p>
      <p><strong>종료 시간:</strong> {{ formatDateTime(selectedSchedule.end) }}</p>
      <p><strong>반복:</strong> {{ getRepeatLabel(selectedSchedule.repeatType) }}</p>
      <p><strong>주소:</strong> {{ selectedSchedule.address }}</p>
      <p>{{ selectedSchedule.content }}</p>
  
      <!-- 이미지 섹션 -->
      <div v-if="selectedSchedule.images && selectedSchedule.images.length > 0" class="schedule-images">
        <div v-for="(image, index) in selectedSchedule.images" :key="index" class="image-container">
          <img :src="image" alt="Schedule Image" class="schedule-image" />
        </div>
      </div>
  
      <button @click="goBack">목록으로 돌아가기</button>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import axios from 'axios';
  import { BASE_URL } from '@/config';
  
  const router = useRouter();
  const route = useRoute();
  const selectedSchedule = ref(null);
  const IMAGE_BASE_URL = 'http://112.222.157.156:10004'; // 고정 이미지 경로
  
  const fetchScheduleDetail = async () => {
    const idx = route.params.idx;
    try {
      const response = await axios.get(`${BASE_URL}/schedule/${idx}`);
      const data = response.data;
  
      // 각 이미지 경로 앞에 고정 URL을 추가
      data.images = data.images.map(image => `${IMAGE_BASE_URL}${image}`);
      selectedSchedule.value = data;
    } catch (error) {
      console.error('스케줄 상세 조회 중 오류 발생:', error.response?.data || error.message);
    }
  };
  
  const goBack = () => {
    router.push({ name: 'schedule' });
  };
  
  const formatDateTime = dateTimeString => {
    if (!dateTimeString) return '';
  
    const [date, time] = dateTimeString.split('T');
    const [hour, minute] = time.split(':');
    let period = 'AM';
    let hourInt = parseInt(hour, 10);
  
    if (hourInt >= 12) {
      period = 'PM';
      if (hourInt > 12) {
        hourInt -= 12;
      }
    }
    if (hourInt === 0) {
      hourInt = 12;
    }
  
    return `${date} ${period} ${String(hourInt).padStart(2, '0')}:${minute}`;
  };
  
  const getRepeatLabel = repeatType => {
    const repeatOptions = {
      NONE: '안함',
      DAILY: '매일',
      WEEKLY: '매주',
      MONTHLY: '매월',
      YEARLY: '매년',
    };
    return repeatOptions[repeatType] || '없음';
  };
  
  onMounted(() => {
    fetchScheduleDetail();
  });
  </script>
  
  <style scoped>
  .schedule-detail {
    background-color: white;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 20px 50px;
    min-height: 500px;
    width: 65%;
    margin: 2vh 5vh;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  }
  
  button {
    background-color: #363636;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    transition:
      background-color 0.3s,
      transform 0.2s;
    margin-top: 15px;
    align-self: flex-end;
  }
  
  button:hover {
    background-color: #646369;
    transform: translateY(-2px);
  }
  
  .schedule-images {
    margin-top: 25px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
  }
  
  .image-container {
    overflow: hidden;
    border-radius: 10px;
    transition: transform 0.3s;
  }
  
  .image-container:hover {
    transform: scale(1.05);
  }
  
  .schedule-image {
    width: 100%;
    height: auto;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    object-fit: cover;
  }
  
  p {
    font-size: 1rem;
    line-height: 1.6;
    color: #333;
    margin-bottom: 10px;
  }
  
  h2 {
    font-size: 2rem;
    font-weight: bold;
    color: #444;
    margin-bottom: 15px;
  }
  </style>
  