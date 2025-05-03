import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../shared/material/material.module';

@Component({
  selector: 'app-photo-uploader',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './photo-uploader.component.html',
  styleUrls: ['./photo-uploader.component.scss']
})
export class PhotoUploaderComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @Output() photoSelected = new EventEmitter<File | string>();
  @Input() maxSizeInMB: number = 5;
  @Input() storageKey: string = 'userProfilePhoto';
  @Input() currentPhoto: string | undefined;
  
  previewUrl: string | null = null;
  fileName: string = '';
  error: string = '';
  
  constructor() {}

  ngOnInit(): void {
    this.loadPhotoFromLocalStorage();

      if (this.currentPhoto && !this.previewUrl) {
      this.previewUrl = this.currentPhoto;
      this.fileName = 'Foto actual';
    }
  }

  loadPhotoFromLocalStorage(): void {
    const savedPhoto = localStorage.getItem(this.storageKey);
    if (savedPhoto) {
      this.previewUrl = savedPhoto;
      this.fileName = 'Foto guardada';
      this.photoSelected.emit(savedPhoto);
    }
  }

  savePhotoToLocalStorage(imageData: string): void {
    try {
      localStorage.setItem(this.storageKey, imageData);
      console.log('Imagen guardada en localStorage correctamente');
    } catch (e) {
      console.error('Error al guardar la imagen en localStorage:', e);
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        this.error = 'No se pudo guardar la imagen. El almacenamiento está lleno.';
      } else {
        this.error = 'Error al guardar la imagen.';
      }
    }
  }
  
  openFileDialog(): void {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type
      if (!this.isImageFile(file)) {
        this.error = 'Por favor, selecciona un archivo de imagen válido (JPG, PNG o GIF).';
        return;
      }
      
      // Validate file size
      if (!this.isValidSize(file)) {
        this.error = `El tamaño del archivo debe ser menor a ${this.maxSizeInMB}MB.`;
        return;
      }
      
      // Reset error if validation passes
      this.error = '';
      this.fileName = file.name;
      
      // Create preview
      this.createPreview(file);
      
      // Emit the selected file
      this.photoSelected.emit(file);
    }
  }
  
  createPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
      this.savePhotoToLocalStorage(this.previewUrl);
    };
    reader.readAsDataURL(file);
  }
  
  removePhoto(): void {
    this.previewUrl = null;
    this.fileName = '';
    this.error = '';
    
    // Reset file input
    if (this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }

    localStorage.removeItem(this.storageKey);
    
    // Emit null or empty string to indicate removal
    this.photoSelected.emit('');
  }
  
  private isImageFile(file: File): boolean {
    const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    return acceptedImageTypes.includes(file.type);
  }
  
  private isValidSize(file: File): boolean {
    // Convert maxSizeInMB to bytes for comparison
    const maxSizeInBytes = this.maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }
}