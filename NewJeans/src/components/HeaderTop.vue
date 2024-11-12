<template>
  <header class="header">
    <div class="search-container">
      <div class="toggle-list custom-toggle-buttons">
        <button v-for="option in toggleOptions" :key="option.value" :class="{ active: selectedOption === option.value }" @click="selectOption(option.value)">
          {{ option.label }}
        </button>
      </div>

      <input type="text" v-model="searchQuery" placeholder="Search" class="search-input" @keyup.enter="goToSearchForm" />
      <button class="search-btn" @click="goToSearchForm">
        <font-awesome-icon :icon="['fas', 'search']" />
      </button>
    </div>
    <div class="logo">
      <RouterLink to="/">
        <img :src="logoSrc" alt="Logo" />
      </RouterLink>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';

const logoSrc = getComputedStyle(document.documentElement).getPropertyValue('--logo-image');
const router = useRouter();
const searchQuery = ref('');
const selectedOption = ref('ALL');

const toggleOptions = [
  { label: '전체', value: 'ALL' },
  { label: '일정', value: 'SCHEDULE' },
  { label: '일기', value: 'DIARY' },
];

// 탭 전환 시 검색어 유지하는 함수
const selectOption = value => {
  selectedOption.value = value;
  
  // localStorage에서 검색어 불러오기
  const savedQuery = localStorage.getItem('lastSearchQuery');
  if (savedQuery) {
    searchQuery.value = savedQuery;
    goToSearchForm(); // 저장된 검색어로 검색 실행
  }
};

// 검색 실행 함수
const goToSearchForm = () => {
  if (!searchQuery.value.trim()) {
    return;
  }
  // 검색어를 localStorage에 저장
  localStorage.setItem('lastSearchQuery', searchQuery.value);
  
  router.push({
    path: '/searchForm',
    query: { query: searchQuery.value, filterType: selectedOption.value },
  });
  
  searchQuery.value = ''; // 검색창 초기화 (필요 시 유지 가능)
};

// 컴포넌트가 마운트될 때, 이전 검색어를 유지하여 입력 필드에 표시
onMounted(() => {
  localStorage.removeItem('lastSearchQuery');
  searchQuery.value = '';
});

</script>


<style scoped>
.toggle-list {
  display: flex;
  margin-right: 1rem;
}
.custom-toggle-buttons button {
  background-color: var(--custom-button-background-color);
  color: var(--custom-button-text-color);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  margin-right: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.custom-toggle-buttons button.active {
  background-color: var(--custom-button-active-background-color);
  color: var(--custom-button-active-text-color);
}

.header {
  display: flex;
  justify-content: center; /* 요소를 수평 중앙에 배치 */
  align-items: center;
  padding: 2rem; /* rem 단위로 패딩 설정 */
  position: relative;
}

.logo {
  position: absolute;
  right: 17vw; /* 화면 너비의 10% 오른쪽에 배치 */
}

.logo img {
  content: var(--logo-image); /* 로고 이미지에 변수 적용 */
  height: var(--logo-height);
  width: auto; /* 비율 유지 */
}

.search-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 30vw; /* 화면 너비의 40%로 설정 */
  position: relative;
  right: 6.5vw; /* 화면 왼쪽으로 5vw 만큼 이동 */
}

.search-input {
  width: 35%; /* 검색창의 너비를 60%로 설정 */
  border: 1px solid #ccc;
  border-radius: 1.5rem; /* 둥근 모서리 크기를 rem 단위로 설정 */
  font-size: 1rem; /* 폰트 크기 설정 */
  padding: 0.5rem 1rem; /* 패딩을 줄여 검색창 높이를 줄임 */
  height: 1.5rem; /* 검색창의 높이를 줄임 */
}

.search-btn {
  background: none;
  border: none;
  margin-left: -3rem; /* 버튼이 입력창 내부로 겹치도록 마진을 음수로 설정 */
  cursor: pointer;
  font-size: 1rem;
}

.search-btn i {
  font-size: 1.2rem; /* 아이콘 크기 */
  color: #555;
}

/* 반응형 디자인을 위한 미디어 쿼리 */
@media (max-width: 768px) {
  .header {
    flex-direction: column; /* 작은 화면에서는 세로로 정렬 */
    padding: 1.5rem;
  }

  .logo {
    position: static; /* 작은 화면에서는 절대 위치를 제거하고 일반 정렬로 변경 */
    margin-bottom: 1rem;
  }

  .logo img {
    height: 4vh; /* 작은 화면에서 로고 크기를 줄임 */
  }

  .search-container {
    left: 0;
    max-width: 90vw; /* 검색창의 너비를 화면의 90%로 설정 */
  }

  .search-input {
    width: 80%; /* 검색창 너비를 조금 더 크게 설정 */
    font-size: 0.9rem; /* 작은 화면에서는 폰트 크기를 줄임 */
  }

  .search-btn {
    font-size: 1rem; /* 버튼 크기를 조금 줄임 */
    margin-left: -2rem;
  }
}
</style>
