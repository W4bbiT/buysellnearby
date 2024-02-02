import { Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";

export const routes: Routes = [
    {
        path: 'home',
        loadComponent: () => import('./pages/tabs/home/home.page').then((m) => m.HomePage),
    },
    {
        path: 'profile',
        loadComponent: () => import('./pages/tabs/profile/profile.page').then(m => m.ProfilePage),
        canActivate: [AuthGuard]
    },

    {
        path: 'chat',
        loadComponent: () => import('./pages/tabs/chat-list/chat-list.page').then(m => m.ChatListPage),
        canActivate: [AuthGuard]
    },
    {
        path: 'add-product',
        loadComponent: () => import('./pages/tabs/add-product/add-product.page').then(m => m.AddProductPage),
        canActivate: [AuthGuard]
    },
];