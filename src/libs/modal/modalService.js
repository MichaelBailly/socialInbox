let openModalFn;
let closeModalFn;
let isOpenedFn = () => {};

export function registerModal(open, close, isOpened) {
  openModalFn = open;
  closeModalFn = close;
  isOpenedFn = isOpened;
}

export function openModal() {
  return openModalFn;
}

export function closeModal() {
  return closeModalFn;
}

export function isOpened() {
  return isOpenedFn();
}
