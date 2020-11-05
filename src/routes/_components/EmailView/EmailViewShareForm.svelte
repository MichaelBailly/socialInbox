<script>
import { onMount } from 'svelte';
import { get, post } from 'api';
import Select from 'svelte-select';
import EmailViewShareModal from "./EmailViewShareModal.svelte";
import { openModal } from '../../../libs/modal/modalService';

export let email;

$: acccessListIds = email.users.concat(email.usersShared);

$: accessList = acccessListIds.map(id => userCache[id] || {});
let loading = false;
let selectedValue = null;
let shareRequestActive = false;
const noOptionsMessage = 'No user';
const userCache = {};
const updateUserCache = (users = []) => {
  users.forEach(user => userCache[user._id] = user);
  return users;
}

// ------------------ SELECT SPECIFIC VARIABLES
const optionIdentifier = '_id';

const getOptionLabel = (option) => option.displayName;
const getSelectionLabel = (option) => option.displayName;

const loadOptions = async (q) => {
  if (!q || q.length < 3) {
    return Promise.resolve([]);
  }
  const users = await get('/api/users', null, { qs: { q } });
  return updateUserCache(users.map(displayUser));
};

// ---------------------------------------------

onMount(async () => {
  const loadTimeout = setTimeout(() => { loading = true }, 600);
  const accessListResponse = await get('/api/users', null, { qs: { ids: acccessListIds.join(',') } });
  clearTimeout(loadTimeout);
  loading = false;
  updateUserCache(accessListResponse.map(displayUser));
});

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

const share = async () => {
  if (shareRequestActive) {
    return false;
  }
  shareRequestActive = true;
  try {
    const response = await post(`/api/emails/${email._id}/share`, {
      userIds: selectedValue.map(u => u._id)
    });
  } catch (e) {
    console.log(e);
  }
  shareRequestActive = false;
  selectedValue = [];
};

const openDialog = () => {
  openModal()(EmailViewShareModal, {
    onYes: share,
    users: selectedValue,
  },{
    closeButton: false
  });
};
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
        <button class="button" disabled={!selectedValue || !selectedValue.length} on:click="{openDialog}" class:is-loading={shareRequestActive}>Add</button>
      </div>
  </div>
</div>

<style lang="less">
  .dropdown-content {
    width: 30rem;
  }
</style>
