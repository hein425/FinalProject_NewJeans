import { createRouter, createWebHistory } from 'vue-router';
import Calendar from '../views/CalendarView.vue';
import Diary from '../views/DiaryView.vue';
import Teams from '../views/TeamsView.vue';
import YearlyCalendar from '@/components/YearlyCalendar.vue';
import Setting from '../views/SettingView.vue';
import SignUpp from '../views/SignUpp.vue';
import ScheduleDayForm from '@/components/ScheduleDayForm.vue';
import SearchForm from '@/components/searchForm.vue';
import DiaryDetail from '@/views/DiaryDetail.vue';
import NotFoundPage from '@/components/NotFoundPage.vue';
import GraphView from '@/views/GraphView.vue';
import KakaoLoginView from '@/views/KakaoLoginView.vue';
import ScheduleDetail from '@/views/ScheduleDetail.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'calendar',
      component: Calendar,
    },
    {
      path: '/diary',
      name: 'diary',
      component: Diary,
    },
    {
      path: '/diary/:idx',
      name: 'DiaryDetail',
      component: DiaryDetail,
      props: true,
    },
    {
      path: '/teams',
      name: 'teams',
      component: Teams,
    },
    {
      path: '/setting',
      name: 'setting',
      component: Setting,
    },
    {
      path: '/signUpp',
      name: 'signUpp',
      component: SignUpp,
    },
    {
      path: '/schedule',
      name: 'ScheduleDay',
      component: ScheduleDayForm, // 일정 조회 컴포넌트
      props: true, // 경로 파라미터를 컴포넌트로 전달
    },
    {
      path: '/yearlyCalendar',
      name: 'YearlyCalendar',
      component: YearlyCalendar,
      props: true,
    },
    {
      path: '/searchForm',
      name: 'SearchForm',
      component: SearchForm, // SearchResults 컴포넌트를 SearchForm 경로에 연결
      props: true,
    },
    {
      path: '/:catchAll(.*)', // catch-all 경로를 정규 표현식으로 설정
      component: NotFoundPage,
    },
    {
      path: '/graphView',
      name: 'GraphView',
      component: GraphView,
    }
    ,
    {
      path:"/kakaologin",
      name:"KakaoLogin",
      component: KakaoLoginView
    },
    {
      path: '/schedule/:idx',
      name: 'ScheduleDetail',
      component: ScheduleDetail,
      props: true,
    },

  ],
});

export default router;
