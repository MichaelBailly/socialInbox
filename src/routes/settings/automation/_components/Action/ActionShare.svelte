<script>
import { createEventDispatcher } from 'svelte';
import Select from 'svelte-select';
import { get } from 'api';

const userCache = {};
const updateUserCache = (users = []) => {
  users.forEach(user => userCache[user._id] = user);
  return users;
}

// ------------------ SELECT SPECIFIC VARIABLES
const optionIdentifier = '_id';
const noOptionsMessage = 'No user';
const getOptionLabel = (option) => option.displayName;
const getSelectionLabel = (option) => option.displayName;

const loadOptions = async (q) => {
  if (!q || q.length < 3) {
    return Promise.resolve([]);
  }
  const users = await get('/api/users', null, { qs: { q } });
  return updateUserCache(users.map(displayUser));
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
// ---------------------------------------------

const dispatch = createEventDispatcher();
let selectedValue = [];


const onValue = () => {
  dispatch('set', selectedValue);
}
</script>

<Select {loadOptions} {optionIdentifier} {getOptionLabel} {getSelectionLabel} {noOptionsMessage} bind:selectedValue isMulti="true" placeholder="Add users..." on:select={onValue}></Select>


