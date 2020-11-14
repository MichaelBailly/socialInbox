<script>
export let automation = {
  name: '',
  description: '',
  trigger: {},
  actions: [],
};

import { goto } from '@sapper/app';
import TriggerTitle from './Trigger/Title.svelte';
import TriggerFrom from './Trigger/From.svelte';
import TriggerRecipient from './Trigger/Recipient.svelte';
import Action from './Action/Action.svelte';
import Automation from '../../../../shared/automation.js';
import { post, put } from 'api';

let newActionPossible = false;
let isAutomationValid = false;
let helperHidden = false;

let triggerHash = {
  title: TriggerTitle,
  from: TriggerFrom,
  recipient: TriggerRecipient,
}

$: {
  if (automation) {
    if (!automation.name) {
      isAutomationValid = false;
    } else if (!automation.trigger.processor) {
      isAutomationValid = false;
    } else if (!automation.trigger.value) {
      isAutomationValid = false;
    } else if (!automation.actions.length) {
      isAutomationValid = false;
    } else if (automation.actions.some(a => a.isFilled === false)) {
      isAutomationValid = false;
    } else {
      isAutomationValid = true;
    }
  } else {
    isAutomationValid = false;
  }
  console.dir(automation);
};

const recordAutomation = async () => {
  const automationProj = Automation.fromObject(automation);

  try {
    let response;
    if (automation._id) {
      response = await put(`/api/automations/${automation._id}`, automationProj);
    } else {
      response = await post('/api/automations', automationProj);
    }
    if (!response || !response._id) {
      throw new Error('/api/automations REST call Unexpected response', response);
    }
    goto('/settings/automation');
  } catch(e) {
    console.log('automation recording failed', e);
  }

}

const onTriggerInput = (event) => {
  let newAutomation = {...automation};
  newAutomation.trigger.value = event.detail;
  automation = newAutomation;
}

const onActionValue = (event) => {
  const { value, processor } = event.detail;
  let newActions = [...automation.actions];
  let isValueFilled = Array.isArray(value) ? !!value.length : !!value;
  newActions[event.detail.id] = { value, processor, isFilled: !!(isValueFilled && processor) };
  newActionPossible = newActions.some(a => a.isFilled === false) ? true : false;
  automation = {...automation, actions: newActions};
}


const addAction = () => {
  let newAutomation = {...automation};
  newAutomation.actions.push({value: '', processor: '', isFilled: false });
  automation = newAutomation;
}

</script>
<div class="pt-3 pr-3">
  <nav class="level p-3">
    <div class="level-left">
      <div class="level-item">
        <h1 class="title">Add new Automation</h1>
      </div>
    </div>
  </nav>
  <div class="contents">
    <div class="form-container">
      <div class="notification is-info is-light" class:is-hidden={helperHidden}>
        <button class="delete" on:click={() => helperHidden = true}></button>
        Automations are automatic actions that are applied when a new mail is received. To create an automation, there are three parts to fill:
        <ol class="pl-5">
          <li class="pt-2">
            <strong>Information</strong>: the basic information about that automation, such as its <em>name</em>.
          </li>
          <li class="pt-2">
            <strong>Trigger</strong>: the condition upon which the automation will be applied on the incoming email
          </li>
          <li class="pt-2">
            <strong>Actions</strong>: the changes that will be applied when the trigger is met.
          </li>
        </ol>
      </div>

      <div>
        <h3 class="title is-5 pb-2">Automation information</h3>
      </div>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label class="label">Automation Name</label>
        </div>
        <div class="field-body">
          <div class="field is-expanded">
            <p class="control">
              <input class="input" type="text" placeholder="Enter Automation Name" bind:value={automation.name}>
            </p>
          </div>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label class="label">Description</label>
        </div>
        <div class="field-body">
          <div class="field is-expanded">
            <div class="control">
              <textarea class="textarea" placeholder="a description to explain why this automation is in place"  bind:value={automation.description}></textarea>
            </div>
          </div>
        </div>
      </div>

      <hr />

      <div>
        <h3 class="title is-5 pb-2">Triggers</h3>
      </div>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label class="label">When...</label>
        </div>
        <div class="field-body">
          <div class="field is-expanded">
            <div class="control">
              <div class="select">
                  <select bind:value={automation.trigger.processor}>
                    <option value="">...</option>
                    <option value="title">title contains...</option>
                    <option value="from">Expeditor contains...</option>
                    <option value="recipient">Recipient contains...</option>
                  </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <svelte:component this={triggerHash[automation.trigger.processor]} value={automation.trigger.value} on:input={onTriggerInput} />

      <hr />

      <div>
          <h3 class="title is-5 pb-2">Actions</h3>
      </div>

      {#each automation.actions as action, index}
        <Action actionId={index} {action} on:action={onActionValue} />
      {/each}

      <p class="py-2">
        <button class="button" disabled={!newActionPossible} on:click={addAction}>Add new action</button>
      </p>

      <hr />

      <div class="field is-grouped">
        <div class="control">
          <button class="button is-link" disabled={!isAutomationValid} on:click={recordAutomation}>Record automation</button>
        </div>
        <div class="control">
          <a class="button is-link is-light" href="/settings/automation">Cancel</a>
        </div>
      </div>

    </div>
  </div>
</div>

<style>
.contents {
  display: flex;
  justify-content: center;
}

.form-container {
  width: 50rem;
}
</style>
