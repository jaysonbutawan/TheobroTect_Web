import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-general-info-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './general-info-form.component.html',
})
export class GeneralInfoFormComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() translating: Record<string, boolean> = {};
  @Input() diseaseKeys: string[] = [];
  @Input() selectedLabel = '';

  @Output() nameInput = new EventEmitter<void>();
  @Output() descriptionInput = new EventEmitter<void>();
  @Output() labelChange = new EventEmitter<string>();

  isDropdownOpen = false;

  formatLabel(key: string): string {
    if (!key) return '';
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  onCustomSelect(key: string): void {
    this.labelChange.emit(key);
    this.isDropdownOpen = false;
  }
}
