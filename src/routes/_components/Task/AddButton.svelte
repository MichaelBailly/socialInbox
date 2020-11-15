<script>
export let email;

import { openModal, closeModal } from '../../../libs/modal/modalService';
import TaskCreateForm from './CreateForm.svelte';

const add = () => {};

const openDialog = () => {
  openModal()(TaskCreateForm, {
    onCreate: add,
    email,
  },{
    closeButton: false
  });
};

</script>

<button class="button is-warning is-small" on:click|stopPropagation={openDialog}>
  <span class="icon is-small">
    <i class="fas fa-tasks"></i>
  </span>
  <span>
    Add task
  </span>
</button>
