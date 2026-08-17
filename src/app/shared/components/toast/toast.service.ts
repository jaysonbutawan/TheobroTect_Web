import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastType } from './toast-notification.component';

export interface ToastState {
  isVisible: boolean;
  type: ToastType;
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new BehaviorSubject<ToastState>({
    isVisible: false,
    type: 'success',
    title: '',
    message: '',
  });

  toast$ = this.toastSubject.asObservable();

  show(type: ToastType, title: string, message: string, duration = 3000): void {
    this.toastSubject.next({ isVisible: true, type, title, message });

    setTimeout(() => {
      this.hide();
    }, duration);
  }

  hide(): void {
    const currentState = this.toastSubject.value;
    this.toastSubject.next({ ...currentState, isVisible: false });
  }
}
