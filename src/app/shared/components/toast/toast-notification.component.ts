import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
  @if (isVisible) {
  <div
    class="relative flex w-full max-w-[450px] items-start justify-between rounded-xl bg-white p-5 pr-12 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-l-[8px] transition-all duration-300"
    [ngClass]="colorClass"
  >
    <div class="flex flex-col gap-1.5">
      <h3 class="text-[18px] font-bold text-[#111827]">{{ title }}</h3>
      <p class="text-[14px] text-[#4B5563]">{{ message }}</p>
    </div>

    <button
      (click)="onClose()"
      class="absolute right-4 top-5 flex h-6 w-6 items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
      aria-label="Close notification"
    >
      <i class="pi pi-times text-sm"></i>
    </button>
  </div>
}

  `
})
export class ToastNotificationComponent {
  // Visibility control
  @Input() isVisible = true;

  // Content
  @Input() title = 'Saved Successfully';
  @Input() message = 'Your changes have been saved successfully.';

  // Style Type: 'success' | 'info' | 'warning' | 'error'
  @Input() type: ToastType = 'success';

  // Event to tell parent to remove/hide the toast
  @Output() closeToast = new EventEmitter<void>();

  // Determine the left border color based on the type
  get colorClass(): string {
    switch (this.type) {
      case 'success':
        return 'border-[#16A34A]'; // Green
      case 'info':
        return 'border-[#3B82F6]'; // Blue
      case 'warning':
        return 'border-[#EAB308]'; // Yellow
      case 'error':
        return 'border-[#EF4444]'; // Red
      default:
        return 'border-[#16A34A]';
    }
  }

  onClose(): void {
    this.isVisible = false;
    this.closeToast.emit();
  }
}
