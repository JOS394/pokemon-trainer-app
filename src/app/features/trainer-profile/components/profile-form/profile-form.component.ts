import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { IdentificationType, Trainer } from '../../../../core/models/trainer.interface';
import { duiValidator } from '../../../../shared/validators/dui.validator';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule
  ],
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss']
})
export class ProfileFormComponent implements OnInit {
  @Input() profilePhoto: string | File = '';
  @Output() formSubmit = new EventEmitter<any>();
  @Input() existingTrainer: Trainer | null = null;
  
  profileForm!: FormGroup;
  isAdult: boolean = false;
  minDate: string;
  maxDate: string;
  selectedHobby: string = '';
  birthDateInput: string = 'text';
  hobbyInput: string = '';
  showOptions: boolean = false;
  hobbySuggestions: string[] = [
    'Jugar Fútbol',
    'Jugar Basquetball',
    'Jugar Tennis',
    'Jugar Voleibol',
    'Jugar Fifa',
    'Jugar Videojuegos',
    'Nadar',
    'Correr',
    'Leer',
    'Cocinar'
  ];
  
  constructor(private fb: FormBuilder) {
    const today = new Date();
    const minAge = new Date(today);
    minAge.setFullYear(today.getFullYear() - 100);
    const maxAge = new Date(today);
    maxAge.setFullYear(today.getFullYear() - 5);
    
    this.minDate = minAge.toISOString().split('T')[0];
    this.maxDate = maxAge.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.initForm();

    if (this.existingTrainer) {
      this.profileForm.patchValue({
        name: this.existingTrainer.name,
        hobby: this.existingTrainer.hobby,
        birthDate: new Date(this.existingTrainer.birthDate).toISOString().split('T')[0],
        identificationType: this.existingTrainer.identification.type,
        identificationNumber: this.existingTrainer.identification.number
      });
    }

    const existingHobby = this.profileForm.get('hobby')?.value;
    if (existingHobby) {
      this.selectedHobby = existingHobby;
      this.hobbyInput = existingHobby;
    }

    if (this.birthDateControl?.value) {
      this.birthDateInput = 'date';
    } else {
      this.birthDateInput = 'text';
    }
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      hobby: ['', Validators.maxLength(100)],
      birthDate: ['', [Validators.required]],
      identificationType: [IdentificationType.MINOR_ID],
      identificationNumber: ['', [Validators.required]] 
    });

    this.profileForm.get('birthDate')?.valueChanges.subscribe(value => {
      if (value) {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        const hasBirthdayOccurred = 
          today.getMonth() > birthDate.getMonth() || 
          (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
        
        const calculatedAge = hasBirthdayOccurred ? age : age - 1;
        this.isAdult = calculatedAge >= 18;
        
        const idType = this.isAdult ? IdentificationType.DUI : IdentificationType.MINOR_ID;
        this.profileForm.get('identificationType')?.setValue(idType);
        
        const idControl = this.profileForm.get('identificationNumber');
        idControl?.reset();
        
        if (this.isAdult) {
          // For DUI: required and valid format
          idControl?.setValidators([Validators.required, duiValidator()]);
        } else {
          // For minor ID: only format validation, not required
          idControl?.setValidators([
            Validators.pattern('^[0-9]{8}$')
          ]);
        }
        
        idControl?.updateValueAndValidity();
      }
    });
  }

  get filteredHobbies(): string[] {
    if (!this.hobbyInput) {
      return this.hobbySuggestions;
    }
    
    const input = this.hobbyInput.toLowerCase();
    return this.hobbySuggestions.filter(hobby => 
      hobby.toLowerCase().includes(input)
    );
  }

  get documentPlaceholder(): string {
    return this.isAdult ? 'DUI*' : 'Carnet de minoridad';
  }

  get nameControl(): AbstractControl | null {
    return this.profileForm.get('name');
  }
  
  get birthDateControl(): AbstractControl | null {
    return this.profileForm.get('birthDate');
  }
  
  get identificationNumberControl(): AbstractControl | null {
    return this.profileForm.get('identificationNumber');
  }
  
  get identificationType(): IdentificationType {
    return this.profileForm.get('identificationType')?.value;
  }

  toggleOptions(): void {
    this.showOptions = !this.showOptions;
  }

  onInputChange(): void {
    this.profileForm.get('hobby')?.setValue(this.hobbyInput);
    this.showOptions = true;
  }
  
  selectHobby(hobby: string): void {
    this.selectedHobby = hobby;
    this.hobbyInput = hobby;
    this.profileForm.get('hobby')?.setValue(hobby);
    this.showOptions = false;
  }
  
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    if (!(event.target as HTMLElement).closest('.pasatiempo-container')) {
      this.showOptions = false;
    }
  }

  clearHobby(event: Event): void {
    event.stopPropagation();
    this.selectedHobby = '';
    this.profileForm.get('hobby')?.setValue('');
    this.hobbyInput = '';
  }

  updateDateInputType(): void {
    if (!this.birthDateControl?.value) {
      this.birthDateInput = 'text';
    }
  }

  formatDui(event: any): void {
    if (!this.isAdult) return;
    
    let value = event.target.value.replace(/[^0-9]/g, '');
    
    if (value.length > 8) {      
      const firstPart = value.substring(0, 8);
      const secondPart = value.substring(8, 9);
      
      if (secondPart) {
        value = `${firstPart}-${secondPart}`;
      } else {
        value = firstPart;
      }
    }
    
    this.profileForm.get('identificationNumber')?.setValue(value, { emitEvent: false });
  }

  submitForm(): void {
    if (this.profileForm.valid) {
      const formData = {
        ...this.profileForm.value
      };
      
      this.formSubmit.emit(formData);
    } else {
      this.profileForm.markAllAsTouched();
    }
  }
}