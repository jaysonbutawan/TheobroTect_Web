import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
     <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">

  <div class="relative w-full max-w-[90vw] xs:max-w-sm sm:max-w-[400px] max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-[24px] bg-[#f9f9f9] p-6 sm:p-8 shadow-2xl text-center">

    <!-- Close Button -->
    <button
      (click)="onCancel()"
      class="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-200/60 text-gray-600 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
      aria-label="Close dialog"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>

    <!-- Content -->
    <h2 class="mt-1 text-xl sm:text-[22px] font-extrabold text-gray-900 leading-snug">{{ title }}</h2>
    <p class="mt-2.5 sm:mt-3 text-sm sm:text-[15px] leading-relaxed text-gray-600 px-1">
      {{ message }}
    </p>

    <!-- Actions -->
    <div class="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3">
      <button
        (click)="onCancel()"
        [disabled]="isLoading"
        class="w-full sm:flex-1 rounded-xl sm:rounded-[12px] border-[1.5px] border-gray-900 py-2.5 sm:py-3 text-sm sm:text-[15px] font-bold text-gray-900 hover:bg-gray-100 disabled:opacity-50 transition-colors"
      >
        {{ cancelText }}
      </button>

      <button
        (click)="onConfirm()"
        [disabled]="isLoading"
        [ngClass]="confirmButtonClass"
        class="w-full sm:flex-1 rounded-xl sm:rounded-[12px] py-2.5 sm:py-3 text-sm sm:text-[15px] font-bold text-white hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
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
