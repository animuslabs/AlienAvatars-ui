import { RouteRecordRaw } from 'vue-router'
import HomePage from 'pages/HomePage.vue'
import PacksPage from 'pages/PacksPage.vue'
import DesignPage from 'pages/DesignPage.vue'
import AvatarsPage from 'pages/AvatarsPage.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'home', component: HomePage },
      { path: '/packs', name: 'packs', component: PacksPage },
      { path: '/packs/buy', name: 'buyPacks', component: PacksPage },
      { path: '/packs/open', name: 'openPacks', component: PacksPage },
      { path: '/design', name: 'design', component: DesignPage },
      {
        path: '/avatars',
        name: 'avatars',
        component: AvatarsPage,
        redirect: { name: 'browseAvatars' },
        children: [
          { path: 'browse', name: 'browseAvatars', component: () => import('pages/AvatarsBrowserPage.vue') },
          { path: 'inventory/:accountName', name: 'avatarInventory', component: () => import('src/pages/AvatarsInventoryPage.vue') }
        ]
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
