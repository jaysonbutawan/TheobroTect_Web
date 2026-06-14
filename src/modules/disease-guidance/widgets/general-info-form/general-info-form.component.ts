import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-general-info-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './general-info-form.component.html'
})
export class GeneralInfoFormComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() translating: Record<string, boolean> = {};
  @Input() diseaseKeys: string[] = [];
  @Input() selectedLabel = '';
  @Input() isSaveDisabled = false;

  @Output() nameInput = new EventEmitter<void>(); // Added to translate names
  @Output() descriptionInput = new EventEmitter<void>();
  @Output() labelChange = new EventEmitter<string>();
  @Output() save = new EventEmitter<void>();

  isDropdownOpen = false; // Added missing state property

  formatLabel(key: string): string {
    if (!key) return '';
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  // Added missing helper to update selections locally before notifying parent
  onCustomSelect(key: string): void {
    this.labelChange.emit(key);
    this.isDropdownOpen = false;
  }
}
