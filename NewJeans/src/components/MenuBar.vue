<template>
  <header>
    <div class="nav_wrapper">
      <Profile :isLoggedIn="authStore.isLoggedIn" :userName="authStore.userName" :profile="authStore.profile" />
      <nav class="menu-grid">
        <button class="menu-item" :class="{ active: activeMenu === 'calendar' }" @click="navigateToCalendar('calendar')">
          <FontAwesomeIcon class="fa-icon" :icon="faCalendarAlt" />
          Calendar
        </button>
        <button class="menu-item" :class="{ active: activeMenu === 'diary' }" @click="navigateToDiary('diary')">
          <FontAwesomeIcon class="fa-icon" :icon="faBook" />
          Diary
        </button>
        <button class="menu-item" :class="{ active: activeMenu === 'teams' }" @click="navigateToTeams('teams')">
          <FontAwesomeIcon class="fa-icon" :icon="faUsers" />
          Friends
        </button>
        <button class="menu-item" :class="{ active: activeMenu === 'setting' }" @click="navigateToSetting('setting')">
          <FontAwesomeIcon class="fa-icon" :icon="faCog" />
          MyPage
        </button>

        <button v-if="!authStore.isLoggedIn" class="menu-item sign-in" @click="showModal = true">
          <FontAwesomeIcon class="fa-icon" :icon="faSignInAlt" />
          Sign In
        </button>

        <button v-else class="menu-item sign-in" @click="handleLogout">
          <FontAwesomeIcon class="fa-icon" :icon="faSignOutAlt" />
          Sign Out
        </button>
      </nav>

      <Modal :show="showModal" @close="showModal = false" />
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Profile from './ProfileSide.vue';
import Modal from './MoDal.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCalendarAlt, faBook, faUsers, faCog, faSignInAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const router = useRouter();
const showModal = ref(false);
const activeMenu = ref(''); // 현재 활성화된 메뉴 상태

const setActiveMenu = menu => {
  activeMenu.value = menu;
};

const navigateToCalendar = menu => {
  setActiveMenu(menu);
  router.push('/');
};

const navigateToDiary = menu => {
  if (!authStore.isLoggedIn) {
    alert('로그인 후 이용해 주십시오.');
    showModal.value = true;
  } else {
    setActiveMenu(menu);
    router.push('/diary');
  }
};

const navigateToTeams = menu => {
  if (!authStore.isLoggedIn) {
    alert('로그인 후 이용해 주십시오.');
    showModal.value = true;
  } else {
    setActiveMenu(menu);
    router.push('/teams');
  }
};

const navigateToSetting = menu => {
  if (!authStore.isLoggedIn) {
    alert('로그인 후 이용해 주십시오.');
    showModal.value = true;
  } else {
    setActiveMenu(menu);
    router.push('/setting');
  }
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/');
  setActiveMenu('');
};

onMounted(() => {
  if (!authStore.isLoggedIn) {
    authStore.restoreLogin();
  }
});
</script>

<style scoped>
.nav_wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 5vh 0 0 17vw;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, 10vh);
  gap: 0;
  width: 12vw;
  margin-top: 2vh;
}

.menu-item {
  padding: 1.5rem 1rem;
  background-color: var(--menu-item-background-color);
  border: 1px solid #ccc;
  text-align: center;
  cursor: pointer;
  font-size: 1rem;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  border-radius: 0;
  color: var(--menu-item-text-color);
}

.menu-item .fa-icon {
  margin-bottom: 0.5rem;
}

.active {
  background-color: var(--menu-item-active-background-color);
  color: var(--menu-item-active-text-color);
  transform: scale(1.1);
  z-index: 1;
  border-color: var(--menu-item-active-border-color);
  border-radius: 0.8rem;
}

/* Calendar 메뉴 */
.menu-item:nth-child(1) {
  border-top-left-radius: 1rem; /* 좌측 상단 모서리 둥글게 */
}

/* Diary 메뉴 */
.menu-item:nth-child(2) {
  border-top-right-radius: 1rem; /* 우측 상단 모서리 둥글게 */
}

.sign-in {
  grid-column: span 2;
  border-bottom-right-radius: 1rem;
  border-bottom-left-radius: 1rem;
  color: var(--menu-item-text-color);
  color: var(--menu-text-color);
}

@media (max-width: 768px) {
  .menu-grid {
    grid-template-columns: 1fr;
    width: 80vw;
    grid-template-rows: repeat(5, 8vh);
  }

  .menu-item {
    font-size: 0.9rem;
    padding: 1rem 0.5rem;
  }
}
</style>
