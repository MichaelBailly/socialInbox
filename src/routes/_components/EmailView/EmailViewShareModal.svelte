<script>
  import { closeModal } from '../../../libs/modal/modalService';

  export let users;
  export let onYes;

  const close = () => closeModal()();

  const _onYes = () => {
		onYes();
		close();
	}
</script>

<article class="message is-link mb-0">
  <div class="message-header">
    <p>Share email</p>
    <button class="delete" aria-label="delete" on:click={close}></button>
  </div>
  <div class="message-body">
    <p>You are going to share this email and all the associated workspace with</p>

    <div class="tags are-medium">
      {#each users as user}
      <span class="tag">{user.displayName}</span>
      {/each}
    </div>

    <p class="has-text-right">
      <button class="button is-outlined" on:click={close}>
        Cancel
      </button>
      <button class="button is-link" on:click={_onYes}>
        Share
      </button>
    </p>
  </div>
</article>
