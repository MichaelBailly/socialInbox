<script>
export let email;

import { openModal, closeModal } from '../../../libs/modal/modalService';
import TaskCreateForm from './CreateForm.svelte';
import { post } from 'api';

const add = async (task) => {
  let id;
  try {
    const response = await post(`/api/tasks/${email._id}`, task);
    id = response._id;
    closeModal()();
  } catch(e) {
    console.log('Unable to create task', e);
  }

};

const openDialog = () => {
  openModal()(TaskCreateForm, {
    onCreate: add,
    onCancel: closeDialog,
    email,
  },{
    closeButton: false
  });
};

const closeDialog = () => closeModal()();

</script>

<button class="button is-warning is-small" on:click|stopPropagation={openDialog}>
  <span class="icon is-small">
    <i class="fas fa-tasks"></i>
  </span>
  <span>
    Add task
  </span>
</button>
