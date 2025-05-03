import { Routes } from '@angular/router';
import { ProfileCreateComponent } from './pages/profile-create/profile-create.component';
import { ProfileEditComponent } from './pages/profile-edit/profile-edit.component';

export const TRAINER_PROFILE_ROUTES: Routes = [
  { path: '', component: ProfileCreateComponent },
  { path: 'edit', component: ProfileEditComponent }
];