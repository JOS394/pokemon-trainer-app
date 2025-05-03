import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TrainerService } from '../../../../core/services/trainer.service';
import { PhotoUploaderComponent } from '../../components/photo-uploader/photo-uploader.component';
import { ProfileFormComponent } from '../../components/profile-form/profile-form.component';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { Trainer } from '../../../../core/models/trainer.interface';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PhotoUploaderComponent,
    ProfileFormComponent,
    LoaderComponent
  ],
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {
  profilePhoto: string | File = '';
  isLoading: boolean = false;
  currentTrainer: Trainer | null = null;
  
  constructor(
    private trainerService: TrainerService,
    private router: Router
  ) {
   
  }  

  ngOnInit(): void {
    this.loadTrainerData();
  }

  loadTrainerData(): void {
    this.isLoading = true;
    this.trainerService.getTrainer().subscribe({
      next: (trainer) => {
        this.currentTrainer = trainer;
        if (trainer?.photo) {
          this.profilePhoto = trainer.photo;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading trainer data:', error);
        this.isLoading = false;
        this.router.navigate(['/profile-create']);
      }
    });
  }

  onPhotoSelected(photo: File | string): void {
    this.profilePhoto = photo;
  }

  onFormSubmit(formData: any): void {
    this.isLoading = true;
    
    const completeData = {
      ...formData,
      photo: this.profilePhoto
    };
    
    this.trainerService.updateTrainer(completeData).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating trainer profile:', error);
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}