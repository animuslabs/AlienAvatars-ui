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
        path: '/stats', name: 'stats', redirect(to) {
        console.log(to);
          location.href = 'https://stats.boid.animus.is/d/m9hVAxX4z/alien-avatars?from=now-1h&to=now&orgId=1'
          return ''
        },
      },
      {
        path: '/umami', name: 'umami', redirect(to) {
        console.log(to);
          location.href = 'https://umami.boid.com/websites/03aa8a1b-3a85-4777-a0dd-969a640ec019'
          return ''
        },
      },

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
