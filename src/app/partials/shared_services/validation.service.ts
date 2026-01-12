// src/app/core/validation.service.ts
import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }

  // Reusable validator to check if a control is required
  static requiredValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value.trim().length === 0) {
        return { required: true };
      }
      return null;
    };
  }

  // Email validator (reusable across forms)
  static emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (control.value && !emailPattern.test(control.value)) {
        return { email: true };
      }
      return null;
    };
  }

  // Min length validator (reusable for password, etc.)
  static minLengthValidator(minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && control.value.length < minLength) {
        return { minlength: { requiredLength: minLength, actualLength: control.value.length } };
      }
      return null;
    };
  }

  // Pattern Validator for general use
  static patternValidator(pattern: RegExp): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && !pattern.test(control.value)) {
        return { pattern: true };
      }
      return null;
    };
  }
}
