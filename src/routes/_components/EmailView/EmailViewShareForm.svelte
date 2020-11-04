<script>
import { get } from 'api';
import Select from 'svelte-select';
import EmailViewShareModal from "./EmailViewShareModal.svelte";
import { openModal } from '../../../libs/modal/modalService';

export let email;

let acccessListIds = email.users.concat(email.usersShared);
let accessList = [];
let loading = false;
let selectedValue = null;
const noOptionsMessage = 'No user';

// ------------------ SELECT SPECIFIC VARIABLES
const optionIdentifier = '_id';

const getOptionLabel = (option) => option.displayName;
const getSelectionLabel = (option) => option.displayName;

const loadOptions = async (q) => {
  if (!q || q.length < 3) {
    return Promise.resolve([]);
  }
  const users = await get('/api/users', null, { qs: { q } });
  return users.map(displayUser);
};

// ---------------------------------------------

const init = async () => {
  const loadTimeout = setTimeout(() => { loading = true }, 600);
  const accessListResponse = await get('/api/users', null, { qs: { ids: acccessListIds.join(',') } });
  clearTimeout(loadTimeout);
  loading = false;
  accessList = accessListResponse.map(displayUser);
};

const displayUser = user => {
  if (user.displayName) {
    return {
      _id: user._id,
      displayName: user.displayName
    };
  }
  if (user.firstname || user.lastname) {
    return {
      _id: user._id,
      displayName: `${user.firstname || ''} ${user.lastname || ''}`
    };
  }
  return {
    _id: user._id,
    displayName: user.email
  };
}

const openDialog = () => {
  openModal()(EmailViewShareModal, {
    onYes: () => { console.log('Yes clicked !' )},
    users: selectedValue,
  },{
    closeButton: false
  });
};

init();


</script>

<div class="dropdown-content">
  <div class="dropdown-item has-text-centered">
    <p>Manage the list of people who can access to this email workzone.</p>
  </div>
  <hr class="dropdown-divider">
  <div class="dropdown-item">
    <p class="has-text-weight-semibold">
      People having access
    </p>
    <div class="tags are-medium">
      {#if loading}
        <progress class="progress is-small is-dark" max="100">45%</progress>
      {/if}
      {#each accessList as user}
      <span class="tag">{user.displayName}</span>
      {/each}
    </div>
  </div>
  <hr class="dropdown-divider">
  <div class="dropdown-item">
      <Select {loadOptions} {optionIdentifier} {getOptionLabel} {getSelectionLabel} {noOptionsMessage} bind:selectedValue isMulti="true" placeholder="Add users..."></Select>
      <br />
      <div class="has-text-right">
        <button class="button" disabled={!selectedValue || !selectedValue.length} on:click|preventDefault="{openDialog}">Add</button>
      </div>
  </div>
</div>

<style lang="less">
  .dropdown-content {
    width: 30rem;
  }
</style>
