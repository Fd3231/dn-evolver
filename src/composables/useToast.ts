import { ref, nextTick } from 'vue';
import { Toast } from 'bootstrap';

export type ToastType = 'success' | 'warning' | 'danger' | 'secondary';
export type ToastPosition = 'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end';

const positionClasses: Record<ToastPosition, string> = {
  'top-start': 'top-0 start-0',
  'top-center': 'top-0 start-50 translate-middle-x',
  'top-end': 'top-0 end-0',
  'bottom-start': 'bottom-0 start-0',
  'bottom-center': 'bottom-0 start-50 translate-middle-x',
  'bottom-end': 'bottom-0 end-0',
};

const toast = ref<{ message: string; type: ToastType; position: ToastPosition } | null>(null);

export const useToast = () => {
  const showToast = (message: string, type: ToastType, position: ToastPosition = 'bottom-end') => {
    toast.value = { message, type, position };
    nextTick(() => {
      const el = document.getElementById('appToast');
      if (el) Toast.getOrCreateInstance(el).show();
    });
  };

  return { toast, showToast, positionClasses };
};