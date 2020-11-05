<script>
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
export let message;
export let messageIndex;
export let messages;

import { isToday, format } from "date-fns";
import { onMount } from 'svelte';
import { getUserAvatar, getDisplayName, user } from '../../../../libs/users';

$: previousMessage = messageIndex === 0 ? null: messages[(messageIndex - 1)];
$: sameUser = previousMessage && message.user._id === previousMessage.user._id;

let avatarUrl;
let displayName;
let showEmail;
let dateDisplay;

onMount(() => {
  avatarUrl = getUserAvatar(message.user, 32);
  displayName = getDisplayName(message.user);
  showEmail = displayName !== message.user.email;
  const date = new Date(message.date);
  if (isToday(date)) {
    dateDisplay = format(date, 'p');
  } else {
    dateDisplay = format(date, 'P p')
  }
});

</script>

{#if sameUser}
<div class="pl-6">{message.body}</div>
{:else}
<article class="media">
  <figure class="media-left">
    <p class="image is-32x32">
      <img src="{avatarUrl}" alt="${displayName} avatar">
    </p>
  </figure>
  <div class="media-content">
    <div class="content">
      <p>
        <strong>{displayName}</strong>
        {#if showEmail}<small>{message.user.email}</small>{/if}
        <small>{dateDisplay}</small>
        <br>
        {message.body}
      </p>
    </div>
  </div>
</article>
{/if}
