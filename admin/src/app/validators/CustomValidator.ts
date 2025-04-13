import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Custom password strength validator
export class CustomValidators {
  static nameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      const namePattern = /^[A-Za-z]+$/;
      const errors: ValidationErrors = {};

      if (!value) {
        errors['required'] = true;
      } else {
        if (!namePattern.test(value)) {
          errors['pattern'] = true;
        }
        if (value.length < 3) {
          errors['minlength'] = { requiredLength: 3 };
        }
        if (value.length > 15) {
          errors['maxlength'] = { requiredLength: 15 };
        }
      }

      return Object.keys(errors).length ? errors : null;
    };
  }

  static emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const errors: ValidationErrors = {};

      if (!value) {
        errors['required'] = true;
      } else {
        if (!emailPattern.test(value)) {
          errors['pattern'] = true;
        }
      }

      return Object.keys(errors).length ? errors : null;
    };
  }

  static passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value;
      const errors: ValidationErrors = {};

      if (!password) {
        errors['required'] = true;
      } else {
        if (!/[A-Z]/.test(password)) {
          errors['uppercase'] = true;
        } else if (!/[a-z]/.test(password)) {
          errors['lowercase'] = true;
        } else if (!/\d/.test(password)) {
          errors['number'] = true;
        } else if (!/[@$!%*?&]/.test(password)) {
          errors['specialChar'] = true;
        } else if (password.length < 8) {
          errors['minLength'] = { requiredLength: 8 };
        }
      }

      return Object.keys(errors).length ? errors : null;
    };
  }
}
