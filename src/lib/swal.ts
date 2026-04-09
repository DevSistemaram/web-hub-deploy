import Swal from 'sweetalert2';

/** Toast de erro (topo direito, auto-fecha) */
export function toastError(message: string) {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'error',
    title: message,
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
  });
}

/** Toast de sucesso */
export function toastSuccess(message: string) {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: message,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });
}

/** Toast informativo (cópia, etc.) */
export function toastInfo(message: string) {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'info',
    title: message,
    showConfirmButton: false,
    timer: 2000,
  });
}

/** Confirmação — retorna true se o usuário confirmou */
export async function confirm(message: string, opts?: { title?: string; confirmText?: string; danger?: boolean }) {
  const result = await Swal.fire({
    title: opts?.title ?? 'Tem certeza?',
    text: message,
    icon: opts?.danger ? 'warning' : 'question',
    showCancelButton: true,
    confirmButtonText: opts?.confirmText ?? 'Confirmar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: opts?.danger ? '#ef4444' : '#3b82f6',
    reverseButtons: true,
  });
  return result.isConfirmed;
}
