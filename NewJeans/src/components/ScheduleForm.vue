<template>
  <div class="schedule-form">
    <form @submit.prevent="submitSchedule">
      <!-- 제목 -->
      <div class="row">
        <label for="title" style="width: 80px; margin-bottom: 5px;">제목</label>
        <input id="title" v-model="title" placeholder="Enter Title" class="input-field" />
      </div>

      <!-- 색깔 선택 -->
      <div class="row">
        <label style="width: 80px; margin-bottom: 5px;">색깔 선택</label>
        <div class="color-options">
          <label v-for="(colorOption, index) in colorList" :key="index" class="color-label">
            <input type="radio" v-model="color" :value="colorOption.value" class="color-radio" />
            <span class="color-circle" :style="{ backgroundColor: colorOption.color }" @click="color = colorOption.value"></span>
          </label>
        </div>
      </div>

      <!-- 시작 날짜, 종료 날짜 -->
      <div class="row">
        <label for="startdate" style="width: 80px; margin-bottom: 5px;">시작 날짜</label>
        <input id="startdate" v-model="startdate" type="datetime-local" class="input-field" />
      </div>
      <div class="row">
        <label for="enddate" style="width: 80px; margin-bottom: 5px;">종료 날짜</label>
        <input id="enddate" v-model="enddate" type="datetime-local" :min="startdate" class="input-field" />
      </div>

      <!-- 반복 설정 -->
      <div class="row">
        <label style="width: 80px; margin-bottom: 5px;">반복</label>
        <div class="repeat-options">
          <label for="yearly" class="radio-label">
            <input id="yearly" type="radio" v-model="repeatType" value="YEARLY" />
            매년
          </label>
          <label for="monthly" class="radio-label">
            <input id="monthly" type="radio" v-model="repeatType" value="MONTHLY" />
            매월
          </label>
          <label for="weekly" class="radio-label">
            <input id="weekly" type="radio" v-model="repeatType" value="WEEKLY" />
            매주
          </label>
          <label for="daily" class="radio-label">
            <input id="daily" type="radio" v-model="repeatType" value="DAILY" />
            매일
          </label>
          <label for="none" class="radio-label">
            <input id="none" type="radio" v-model="repeatType" value="NONE" />
            안함
          </label>
        </div>
      </div>

      <div class="row" v-if="repeatType !== 'NONE'">
        <label for="repeatEndDate" style="width: 80px; margin-bottom: 5px;">반복 종료</label>
        <input id="repeatEndDate" v-model="repeatEndDate" type="date" class="input-field" />
      </div>

      <!-- 지도 -->
      <div class="row">
        <label for="location" style="width: 80px; margin-bottom: 5px;">지도</label>
        <div class="map-container">
          <KakaoMap @updateLocation="updateLocation"/>
        </div>
      </div>

      <!-- 내용 입력 -->
      <div class="row">
        <label for="content" style="width: 80px; margin-bottom: 5px;">메모</label>
        <textarea id="content" v-model="description" placeholder="Enter your note" class="input-field textarea-field"></textarea>
      </div>

      <!-- 이미지 업로드 -->
      <div class="row">
        <label for="image" style="width: 80px; margin-bottom: 5px;">이미지</label>
        <input id="image" type="file" @change="handleImageUpload" multiple class="input-field" />
      </div>

      <div class="image-preview">
        <div v-for="(image, index) in images" :key="index" class="image-container">
          <img :src="image.url" alt="Preview" />
          <button class="delete-btn" @click="removeImage(index)">X</button>
        </div>
      </div>

      <!-- 버튼 -->
      <div class="button-row">
        <button type="submit" class="submit-button">
          <font-awesome-icon :icon="['fas', 'check']" style="font-size: 24px; color: white" />
        </button>
        <button type="button" @click="cancelForm" class="cancel-button">
          <font-awesome-icon :icon="['fas', 'times']" style="font-size: 24px; color: white" />
        </button>
      </div>
    </form>
  </div>
</template>



<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import dayjs from 'dayjs';
import KakaoMap from '@/views/KakaoMap.vue';
import { BASE_URL } from '@/config';
import { useAuthStore } from '@/stores/authStore';

const props = defineProps({
  selectedDate: String,
});
const emit = defineEmits(['closeForm']);

const authStore = useAuthStore();

const title = ref('');
const color = ref('ORANGE');
const startdate = ref('');
const enddate = ref('');
const location = ref('');
const description = ref('');
const repeatType = ref('NONE');
const repeatEndDate = ref(''); // 반복 종료 날짜를 추가
const images = ref([]); // 이미지 파일을 저장
const calendarIdx = ref(authStore.calendarIdx);

const colorList = [
  { value: 'PINK', color: '#ff7f7f' },
  { value: 'ORANGE', color: '#ff9933' },
  { value: 'YELLOW', color: '#ffe066' },
  { value: 'BLUE', color: '#4da6ff' },
  { value: 'GREEN', color: '#5cd65c' },
  { value: 'VIOLET', color: '#b366ff' },
  { value: 'GRAY', color: '#a6a6a6' },
];

const updateLocation = coords => {
  console.log('부모 컴포넌트에서 받은 좌표:', coords);
  location.value = `${coords.lat}, ${coords.lng}`; // 위치를 위도, 경도로 저장
  console.log('위치 업데이트:', location.value);
};

onMounted(() => {
  if (props.selectedDate) {
    startdate.value = dayjs(props.selectedDate).format('YYYY-MM-DDTHH:mm');
  }
});

// 이미지 업로드 핸들러
const handleImageUpload = event => {
  const files = Array.from(event.target.files); // 선택한 모든 파일을 배열로 변환
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      images.value.push({ file, url: e.target.result }); // 이미지 파일과 URL을 모두 추가
    };
    reader.readAsDataURL(file);
  });
  event.target.value = ''; // 입력 초기화
};

const submitSchedule = async () => {
  //제목없으면 얼럿 띄우고 중단
  if (!title.value.trim()) {
    alert('제목을 입력해주세요.');
    return;
  }

  // scheduleRequest JSON 객체 생성
  const scheduleRequest = {
    title: title.value,
    color: color.value,
    start: startdate.value,
    end: enddate.value,
    location: location.value,
    content: description.value,
    calendarIdx: calendarIdx.value,
    repeatType: repeatType.value,
    repeatEndDate: repeatEndDate.value || null, // 반복 종료 날짜 추가
  };

  // FormData 생성 및 diaryRequest JSON과 이미지 파일 추가
  const formData = new FormData();
  formData.append(
    'scheduleRequest',
    new Blob([JSON.stringify(scheduleRequest)], {
      type: 'application/json',
    }),
  ); // JSON 데이터를 문자열로 변환해 추가

  // 이미지 파일이 선택된 경우 FormData에 추가
  if (images.value.length > 0) {
    images.value.forEach(image => {
      formData.append('imageFiles', image.file); // 이미지 파일 추가
    });
  } else {
    formData.append('imageFiles', new Blob([], { type: 'application/octet-stream' })); // 빈 Blob 추가
  }

  try {
    const response = await axios.post(`${BASE_URL}/schedule/create`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Schedule Submitted Successfully', response.data);

    emit('closeForm');
  } catch (error) {
    console.error('Failed to submit Schedule:', error);
    emit('closeForm');
  }
};

const cancelForm = () => {
  emit('closeForm');
};

// 시작일 정하면 자동으로 종료일은 같은날 1시간후로.
watch(startdate, newStartDate => {
  if (newStartDate) {
    const newEndDate = dayjs(newStartDate).add(1, 'hour').format('YYYY-MM-DDTHH:mm');
    enddate.value = newEndDate;
  }
});

const removeImage = (index) => {
  images.value.splice(index, 1); // 선택한 이미지를 배열에서 제거
};

</script>
<style scoped>
.schedule-form {
  border: 1px solid #ccc;
  margin-top: 10vh;
  padding: 20px;
  border-radius: 10px;
  height: auto;
}

.row {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #ccc;
  padding: 10px 0;
  font-weight: bold;
}

.color-options {
  align-items: center;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.color-label input:checked + .color-circle {
  border: 3px solid #000; /* 선택 시 검정색 테두리를 추가 */
  box-shadow: 0 0 5px 2px rgba(0, 0, 0, 0.3); /* 약간의 그림자 효과 추가 */
}

.color-circle {
  margin-top: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #ccc;
  display: inline-block;
  cursor: pointer;
  box-sizing: border-box; /* 테두리가 요소의 크기를 변경하지 않도록 */
  transition: border 0.3s ease, box-shadow 0.3s ease; /* 애니메이션 추가 */
}

.color-radio {
  display: none;
}

input, select, textarea {
  border: none;
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  font-size: 1rem;
}

.textarea-field {
  height: 220px;
  resize: none;
}

.repeat-options {
  justify-content: center;
  display: flex;
  flex-direction: row;
  gap: 20px;
  flex-wrap: nowrap; /* 줄바꿈 방지 */

}

.radio-label {
  display: flex;
  align-items: center; /* 라디오 버튼과 텍스트를 한 줄로 정렬 */
  gap: 5px;
  white-space: nowrap; /* 얘도 줄바꿈 방지 */
}

.image-preview {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
}

.image-container {
  margin: 5px;
  position: relative;
}

.image-container img {
  width: 100px;
  height: 100px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
  margin-bottom: 10px;
}

.submit-button, .cancel-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.submit-button {
  background-color: #343434;
  color: white;
}

/* .map-container{
  display: flex;
  justify-content: center;
  width: 100%;
} */

.cancel-button {
  background-color: #808080;
  color: white;
}

.delete-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: red;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>
