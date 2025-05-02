import { Routes } from '@angular/router';
import { profileCompleteGuard } from './core/guards/profile-complete.guard';
// import { profileCompleteGuard } from './core/guards/profile-complete.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/trainer-profile/create',
    pathMatch: 'full'
  },
  
  {
    path: 'pokemon-selection',
    loadComponent: () => import('./features/pokemon-selection/pages/team-selection/team-selection.component')
      .then(m => m.TeamSelectionComponent),
    canActivate: [profileCompleteGuard]
  },
  {
    path: 'trainer-profile',
    children: [
      {
        path: 'create',
        loadComponent: () => import('./features/trainer-profile/pages/profile-create/profile-create.component')
          .then(m => m.ProfileCreateComponent)
      },
      // {
      //   path: 'edit',
      //   loadComponent: () => import('./features/trainer-profile/pages/profile-edit/profile-edit.component')
      //     .then(m => m.ProfileEditComponent),
      //   canActivate: [profileCompleteGuard]
      // }
    ]
  },

  // {
  //   path: 'dashboard',
  //   loadComponent: () => import('./features/trainer-dashboard/pages/dashboard/dashboard.component')
  //     .then(m => m.DashboardComponent),
  //   canActivate: [profileCompleteGuard]
  // },
  {
    path: '**',
    redirectTo: '/trainer-profile/create'
  }
];