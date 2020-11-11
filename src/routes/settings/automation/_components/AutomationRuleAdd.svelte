<script>
export let onYes;
export let onCancel;

export let selectedName;
export let selectedDescription;

const validate = () => {
  onYes();
}

</script>

<article class="message">
  <div class="message-header">
    <p>Add new label</p>
    <button class="delete" aria-label="delete" on:click="{onCancel}"></button>
  </div>
  <div class="message-body">
    <div class="field">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="label">Name</label>
      <div class="control">
        <input class="input" type="text" placeholder="Label Name" bind:value="{selectedName}">
      </div>
    </div>
    <div class="field">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="label">Description</label>
      <div class="control">
        <textarea class="textarea" placeholder="Label Description" bind:value="{selectedDescription}"></textarea>
      </div>
    </div>
    <div class="field is-grouped">
      <div class="control">
        <button class="button is-link" on:click="{validate}">Create</button>
      </div>
      <div class="control">
        <button class="button is-link is-light"  on:click="{onCancel}">Cancel</button>
      </div>
    </div>
  </div>
</article>

<style>
.tag-control {
  background-color: white;
}
.tag {
  margin: 0 0.5em;
  border: 1px solid #bbb;
  transition: transform ease-in 0.2s;
}

.tag.selected {
  transform: scale(1.4);
}
</style>
