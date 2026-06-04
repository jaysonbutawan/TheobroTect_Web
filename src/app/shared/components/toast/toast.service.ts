import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastType } from './toast-notification.component'; // Adjust path

export interface ToastState {
  isVisible: boolean;
  type: ToastType;
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root' // 🌟 This makes it available app-wide
})
export class ToastService {
  private toastSubject = new BehaviorSubject<ToastState>({
    isVisible: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Components will listen to this
  toast$ = this.toastSubject.asObservable();

  show(type: ToastType, title: string, message: string, duration = 3000): void {
    this.toastSubject.next({ isVisible: true, type, title, message });

    // Auto-hide after the duration
    setTimeout(() => {
      this.hide();
    }, duration);
  }

  hide(): void {
    const currentState = this.toastSubject.value;
    this.toastSubject.next({ ...currentState, isVisible: false });
  }
}
