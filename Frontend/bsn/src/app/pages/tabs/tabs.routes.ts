import { Routes } from "@angular/router";
import { AuthGuard } from "src/app/guards/auth.guard";
import { TabsPage } from "./tabs.page";
export const routes: Routes = [

    {
        path: '',
        component: TabsPage,
        children: [
            {
                path: 'home',
                loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
            },
            {
                path: 'chat',
                loadComponent: () => import('./chat-list/chat-list.page').then(m => m.ChatListPage),
                canActivate: [AuthGuard]
            },
            {
                path: 'add-product',
                loadComponent: () => import('./add-product/add-product.page').then(m => m.AddProductPage),
                canActivate: [AuthGuard]
            },
            {
                path: 'profile',
                loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage),
                canActivate: [AuthGuard]
            },
            {
                path:'',
                redirectTo: './tabs/home',
                pathMatch: 'full'
            }
        ]
    },
];