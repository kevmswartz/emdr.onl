import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/pre-journal',
    name: 'pre-journal',
    component: () => import('../components/PreSessionJournal.vue'),
  },
  {
    path: '/session',
    name: 'session',
    component: () => import('../components/SessionView.vue'),
  },
  {
    path: '/post-journal',
    name: 'post-journal',
    component: () => import('../components/PostSessionJournal.vue'),
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('../components/HistoryView.vue'),
  },
  {
    path: '/feedback',
    name: 'feedback',
    component: () => import('../components/FeedbackView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
