import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Category } from '../../core/models/category.model';

// handle category ids and names in the same array
export function normalizeCategoryIds(
  categories: Array<string | number> | null | undefined,
  categoryOptions: Category[]
): number[] {
  if (!categories?.length) {
    return [];
  }
  return categories.reduce<number[]>((categoryIds, category) => {
    const match = categoryOptions.find((option) =>
      typeof category === 'number'
        ? option.id === category
        : option.name === category
    );
    if (match) {
      categoryIds.push(match.id);
    } else if (typeof category === 'number' && category > 0) {
      categoryIds.push(category);
    }
    return categoryIds;
  }, []);
}


  // Custom validator to ensure new password and confirm password match
  export function passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmControl = control.get('confirmPassword');
    if (
      newPassword &&
      confirmControl?.value &&
      newPassword !== confirmControl.value
    ) {
      confirmControl.setErrors({
        ...confirmControl.errors,
        passwordMismatch: true
      });
      return { passwordMismatch: true };
    }
    if (confirmControl?.hasError('passwordMismatch')) {
      const errors = { ...confirmControl.errors };
      delete errors['passwordMismatch'];
      confirmControl.setErrors(Object.keys(errors).length ? errors : null);
    }
    return null;
  }