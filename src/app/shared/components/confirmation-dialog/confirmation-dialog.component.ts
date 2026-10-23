import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div
        class="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title"
      >
        <div class="w-full max-w-sm rounded-2xl bg-white border border-slate-200 p-6">
          <h2 class="text-lg font-semibold text-slate-900 m-0">{{ title }}</h2>
          <p class="mt-2 mb-0 text-sm leading-relaxed text-slate-600">{{ message }}</p>

          <div class="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button
              (click)="onCancel()"
              [disabled]="isLoading"
              class="px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-green-700"
            >
              {{ cancelText }}
            </button>
            <button
              (click)="onConfirm()"
              [disabled]="isLoading"
              [ngClass]="confirmButtonClass"
              class="px-4 py-2.5 rounded-lg text-sm font-medium text-white hover:brightness-110 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-green-700"
            >
              {{ isLoading ? 'Please wait…' : confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmationDialogComponent {
  @Input() isOpen = false;

  @Input() title = 'Are you sure?';
  @Input() message = 'Are you sure you want to delete this item? This action cannot be undone.';
  @Input() cancelText = 'Cancel';
  @Input() confirmText = 'Delete';

  @Input() confirmButtonClass = 'bg-[#ED407B]';

  @Input() isLoading = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
