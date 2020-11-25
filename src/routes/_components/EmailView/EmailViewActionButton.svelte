<script>
export let email;

import { openModal, closeModal } from '../../../libs/modal/modalService';
import LabelSelect from '../../_components/Labels/LabelSelect.svelte';
import TaskCreateForm  from '../Task/CreateForm.svelte';
import ClickOutside from '../ClickOutside.svelte';
import { put } from 'api';

let menuOpened = false;

const updateLabels = async (labelIds) => {
  closeModal()();
  menuOpened = false;
  await put(`/api/emails/${email._id}/labels`, { labelIds });
}

const openLabelDialog = () => {
  const emailLabelIds = (email.labels || []).map(l => l._id);

  openModal()(LabelSelect, {
    labelIds: emailLabelIds,
    onYes: updateLabels,
    onCancel: closeModal(),
  },{
    closeButton: false
  });
}

const openTaskDialog = () => {
  menuOpened = false;

  openModal()(TaskCreateForm, {
    email,
    onCreate: closeModal(),
    onCancel: closeModal(),
  },{
    closeButton: false
  });
}

const closeMenu = () => {
  menuOpened = false;
}
</script>

<ClickOutside on:clickoutside={closeMenu}>
  <div class="dropdown is-right" class:is-active={menuOpened}>
    <div class="dropdown-trigger">
      <button class="button is-small" aria-haspopup="true" aria-controls="dropdown-menu" on:click='{() => menuOpened = !menuOpened}'>
        <span class="icon is-small">
          <i class="fas fa-ellipsis-v" aria-hidden="true"></i>
        </span>
      </button>
    </div>
    <div class="dropdown-menu" id="dropdown-menu" role="menu">
      <div class="dropdown-content">
        <!-- svelte-ignore a11y-missing-attribute -->
        <a class="dropdown-item" on:click="{openLabelDialog}">Set/unset labels</a>
        <!-- svelte-ignore a11y-missing-attribute -->
        <a class="dropdown-item" on:click="{openTaskDialog}">Add task</a>
      </div>
    </div>
  </div>
</ClickOutside>
