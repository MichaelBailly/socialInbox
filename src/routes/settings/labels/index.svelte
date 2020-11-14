<script>
import { openModal, closeModal } from '../../../libs/modal/modalService';
import LabelsAdd from '../../_components/Labels/Add.svelte';
import { post } from 'api';
import { labels } from '../../../libs/labels/labelProvider';
import Label from '../../_components/Labels/Label.svelte';


const createLabel = async (newLabel) => {
  closeModal()();
  await post('/api/labels', newLabel);
};


const openDialog = () => {
  openModal()(LabelsAdd, {
    onYes: createLabel,
    onCancel: closeModal(),
  },{
    closeButton: false
  });
};


</script>

<svelte:head>
	<title>Labels - Settings - SoBox</title>
</svelte:head>

<div class="label-settings pt-3 pr-3">
  <nav class="level p-3">
    <div class="level-left">
      <div class="level-item">
        <h1 class="title">Labels</h1>
      </div>
    </div>
    <div class="level-right">
      <div class="level-item">
        <button class="button is-link is-outlined" on:click="{openDialog}">Add new...</button>
      </div>
    </div>
  </nav>
  <div class="contents">
    {#each $labels as label}
    <div>
      <p><Label {label} /></p>
      <p>{label.description}</p>
      <hr />
    </div>
    {/each}
  </div>
</div>

<style lang="less">
nav {
  border-bottom: 1px solid #eee;
}
</style>
