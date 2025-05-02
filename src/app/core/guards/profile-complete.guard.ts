import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TrainerService } from '../services/trainer.service';

export const profileCompleteGuard: CanActivateFn = (route, state) => {
  const trainerService = inject(TrainerService);
  const router = inject(Router);
  
  // Check if the trainer profile exists
  if (trainerService.hasTrainerProfile()) {
    return true;
  }
  
  // Redirect to profile creation if no profile exists
  router.navigate(['/trainer-profile/create']);
  return false;
};