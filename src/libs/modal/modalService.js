let openModalFn;
let closeModalFn;

export function registerModal(open, close) {
  openModalFn = open;
  closeModalFn = close;
}

export function openModal() {
  return openModalFn;
}

export function closeModal() {
  return closeModalFn;
}
