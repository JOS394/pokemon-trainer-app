import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function duiValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const value = control.value.toString().trim();
    const pattern = /^[0-9]{8}-[0-9]{1}$/;
    
    if (!pattern.test(value)) {
      return { invalidDui: true };
    }
    
    const digits = value.substring(0, 8).split('').map(Number);
    
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      sum += digits[i] * (9 - i);
    }
    
    const mod = sum % 10;
    
    const expectedVerifier = mod === 0 ? 0 : 10 - mod;
    
    const verifier = parseInt(value.substring(9, 10));
    
    if (verifier !== expectedVerifier) {
      return { invalidDui: true };
    }
    
    return null;
  };
}

function isValidDuiCheckDigit(mainDigits: string, checkDigit: number): boolean {

  const weights = [9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  

  for (let i = 0; i < 8; i++) {
    sum += parseInt(mainDigits[i], 10) * weights[i];
  }
  
  const remainder = sum % 10;
  
  const expectedCheckDigit = remainder === 0 ? 0 : 10 - remainder;
  
  return checkDigit === expectedCheckDigit;
}