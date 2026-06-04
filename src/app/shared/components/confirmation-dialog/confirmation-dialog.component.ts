import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">

        <div class="relative w-full max-w-[400px] rounded-[24px] bg-[#f9f9f9] p-8 shadow-2xl text-center">

          <button
            (click)="onCancel()"
            class="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200/60 text-gray-600 hover:bg-gray-300 transition-colors"
            aria-label="Close dialog"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <h2 class="mt-2 text-[22px] font-extrabold text-gray-900">{{ title }}</h2>
          <p class="mt-3 text-[15px] leading-relaxed text-gray-600 px-1">
            {{ message }}
          </p>

          <div class="mt-8 flex gap-3">
            <button
              (click)="onCancel()"
              [disabled]="isLoading"
              class="flex-1 rounded-[12px] border-[1.5px] border-gray-900 py-3 text-[15px] font-bold text-gray-900 hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              {{ cancelText }}
            </button>
            <button
              (click)="onConfirm()"
              [disabled]="isLoading"
              [ngClass]="confirmButtonClass"
              class="flex-1 rounded-[12px] py-3 text-[15px] font-bold text-white hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              @if (isLoading) {
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              }
              {{ confirmText }}
            </button>
          </div>

        </div>
      </div>
    }
  `
})
export class ConfirmationDialogComponent {
  // Visiblity control
  @Input() isOpen = false;

  // Content configuration
  @Input() title = 'Are you sure?';
  @Input() message = 'Are you sure you want to delete this item? This action cannot be undone.';
  @Input() cancelText = 'Cancel';
  @Input() confirmText = 'Delete';

  // Styling configuration - Defaults to the pink color from your image
  @Input() confirmButtonClass = 'bg-[#ED407B]';

  // State configuration
  @Input() isLoading = false;

  // Event emitters
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
