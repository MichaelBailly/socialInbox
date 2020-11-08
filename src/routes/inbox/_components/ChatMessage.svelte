<script>
export let item;
export let previousItem;
export let email;

 /*
  {
    "_id":"5fa4778713eecab05faeb4d9",
    "emailId":"a2d8d840-1e4c-11eb-ba30-6fc9e580b935",
    "user":{
      "_id":"599aefa0a310ed32d28d52e6",
      "email":"usera@qa.open-paas.org",
      "displayName":null,
      "firstname":"User",
      "lastname":"A"
    },
    "uuid":"c8d22308-8a80-4aa6-a3d0-6cfaabd4ca43",
    "body":"qsd",
    "date":"2020-11-05T22:06:24.502Z"
  }
  */
import { isToday, format } from "date-fns";
import { onMount } from 'svelte';
import { getUserAvatar, getDisplayName } from '../../../libs/users';

$: sameUser = previousItem && previousItem.uuid && item.user._id === previousItem.user._id;

let avatarUrl;
let displayName;
let showEmail;
let dateDisplay;

onMount(() => {
  avatarUrl = getUserAvatar(item.user, 32);
  displayName = getDisplayName(item.user);
  showEmail = displayName !== item.user.email;
  const date = new Date(item.date);
  if (isToday(date)) {
    dateDisplay = format(date, 'p');
  } else {
    dateDisplay = format(date, 'P p')
  }
});
</script>

{#if sameUser}
<div class="same-user-message" class:pending="{item.pending}">{item.body}</div>
{:else}
<article class="media mt-4" class:pending="{item.pending}">
  <figure class="mr-2">
    <p class="image has-text-centered">
      <img class="is-rounded" src="{avatarUrl}" alt="${displayName} avatar">
    </p>
  </figure>
  <div class="media-content">
    <div class="content">
      <p>
        <strong>{displayName}</strong>
        {#if showEmail}<small>{item.user.email}</small>{/if}
        <small>{dateDisplay}</small>
        <br>
        {item.body}
      </p>
    </div>
  </div>
</article>
{/if}

<style lang="less">
.pending {
  background-color: #ddd;
  opacity: 0.8;
}
.image {
  width: 2em;
  height: 2em;
}

.same-user-message {
  padding-left: 2.5rem;
}

img {
  display: inline-block;
  width: 1.33em;
  height: 1.33em;
}
</style>
