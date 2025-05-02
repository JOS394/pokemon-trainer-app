import { AbstractControl, ValidationErrors } from '@angular/forms';

export function ageValidator(minAge: number = 0): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    
    const birthDate = new Date(control.value);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= minAge ? null : { minAge: { required: minAge, actual: age } };
  };
}