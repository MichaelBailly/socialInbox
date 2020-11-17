<script>
import { onMount } from "svelte";
import { fade } from "svelte/transition";
import { openModal, closeModal } from '../../../libs/modal/modalService';
import TaskCreateForm from './CreateForm.svelte';

export let coords = [0, 0];
export let selectedText = '';
export let closeMenu = () => {};

let menu;

let openEventTrapped = false;

const handleClickOutside = (event) => {
  if (!openEventTrapped) {
    openEventTrapped = true;
    return;
  }
  if (menu && !menu.contains(event.target) && !event.defaultPrevented) {
    closeMenu();
  }
}

const handleKeypress = (event) => {
  if (event.key === 'Escape') {
    closeMenu();
  }
}

onMount(() => {
  menu.style.left = `${coords[0] - 100}px`;
  menu.style.top = `${coords[1] + 20}px`;
})

const openTaskDialog = () => {
  closeMenu(selectedText);
}

</script>

<svelte:body on:click={handleClickOutside} on:keydown={handleKeypress} />

<div class="has-background-white-bis p-2" bind:this="{menu}" transition:fade="{{delay: 50, duration: 200}}">
  <button class="button is-outlined" on:click={openTaskDialog}>
    Set in task
  </button>
</div>

<style>
div {
  position: absolute;
  border: 2px solid rgba(200,200,200,0.6);
  border-radius: 5px;
}
</style>
