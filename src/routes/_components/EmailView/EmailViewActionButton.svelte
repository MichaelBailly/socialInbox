<script>
export let email;

import { openModal, closeModal } from '../../../libs/modal/modalService';
import LabelSelect from '../../_components/Labels/LabelSelect.svelte';

const updateLabels = (ids) => {
  console.log('should set', ids);
}

const openDialog = () => {
  const emailLabelIds = (email.labels || []).map(l => l._id);

  openModal()(LabelSelect, {
    labelIds: emailLabelIds,
    onYes: updateLabels,
    onCancel: closeModal(),
  },{
    closeButton: false
  });
}
</script>

<div class="dropdown is-right is-active">
  <div class="dropdown-trigger">
    <button class="button is-small" aria-haspopup="true" aria-controls="dropdown-menu">
      <span class="icon is-small">
        <i class="fas fa-ellipsis-v" aria-hidden="true"></i>
      </span>
    </button>
  </div>
  <div class="dropdown-menu" id="dropdown-menu" role="menu">
    <div class="dropdown-content">
        <a class="dropdown-item" on:click="{openDialog}">Set/unset labels</a>
    </div>
  </div>
</div>
