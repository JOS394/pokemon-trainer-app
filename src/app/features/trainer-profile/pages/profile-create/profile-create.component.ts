import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TrainerService } from '../../../../core/services/trainer.service';
import { PhotoUploaderComponent } from '../../components/photo-uploader/photo-uploader.component';
import { ProfileFormComponent } from '../../components/profile-form/profile-form.component';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-profile-create',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PhotoUploaderComponent,
    ProfileFormComponent,
    LoaderComponent
  ],
  templateUrl: './profile-create.component.html',
  styleUrls: ['./profile-create.component.scss']
})
export class ProfileCreateComponent implements OnInit {
  profilePhoto: string | File = '';
  isLoading: boolean = false;
  
  constructor(
    private trainerService: TrainerService,
    private router: Router
  ) {
   
  }  

  ngOnInit(): void {
    
  }

  onPhotoSelected(photo: File | string): void {
    this.profilePhoto = photo;
  }

  onFormSubmit(formData: any): void {
    this.isLoading = true;
    
    if (this.profilePhoto) {
      const completeData = {
        ...formData,
        photo: this.profilePhoto
      };
      
      this.trainerService.saveTrainer(completeData).subscribe({
        next: () => {
          this.router.navigate(['/pokemon-selection']);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error saving trainer profile:', error);
          this.isLoading = false;
        }
      });
    }
  }
}