<script>
export let onYes;
export let onCancel;

import { COLORS } from '../../../libs/labels/helpers';

let selectedColor;
let selectedName;
let selectedDescription;

$: isValid = selectedColor && selectedDescription && selectedName;

const validate = () => {
  onYes({
    colorId: selectedColor,
    name: selectedName,
    description: selectedDescription,
  })
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
    <div class="field">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="label">Color</label>
      <div class="control tag-control pt-2">
        {#each Object.keys(COLORS) as colorId}
        <span class="tag {COLORS[colorId]}" on:click="{() =>  selectedColor = colorId}" class:selected="{selectedColor === colorId}" />
        {/each}
      </div>
    </div>
    <div class="field is-grouped">
      <div class="control">
        <button class="button is-link" disabled={!isValid} on:click="{validate}">Create</button>
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
