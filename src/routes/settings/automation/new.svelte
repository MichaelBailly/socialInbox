<script>
import { goto } from '@sapper/app';
import TriggerTitle from './_components/Trigger/Title.svelte';
import Action from './_components/Action/Action.svelte';
import Automation from '../../../shared/automation.js';
import { post } from 'api';

let triggerName = '';
let triggerValue = '';
let automationName = '';
let automationDescription = '';

let actions = [];
let newActionPossible = false;
let isAutomationValid = false;
let isRecording = false;
let helperHidden = false;

let triggerHash = {
  'title': TriggerTitle,
}

$: {
  if (!automationName) {
    isAutomationValid = false;
  } else if (!triggerName) {
    isAutomationValid = false;
  } else if (!triggerValue) {
    isAutomationValid = false;
  } else if (!actions.length) {
    isAutomationValid = false;
  } else if (actions.some(a => a.isFilled === false)) {
    isAutomationValid = false;
  } else {
    isAutomationValid = true;
  }
  console.dir({
    isAutomationValid,
    triggerName,
    triggerValue,
    actions: actions.some(a => a.isFilled === false)
  });
};

const recordAutomation = async () => {
  isRecording = true;
  const automation = Automation.fromObject({
    name: automationName,
    description: automationDescription,
    trigger: {
      processor: triggerName,
      value: triggerValue
    },
    actions,
  });

  try {
    const response = await post('/api/automations', automation);
    if (!response || !response._id) {
      throw new Error('POST /api/automation: Unexpected response', response);
    }
    goto('/settings/automation');
  } catch(e) {
    console.log('automation recording failed', e);
    isRecording = false;
  }

}

const onTriggerInput = (event) => {
  triggerValue = event.detail;
}

const onActionValue = (event) => {
  const { value, processor } = event.detail;
  let newActions = [...actions];
  let isValueFilled = Array.isArray(value) ? !!value.length : !!value;
  newActions[event.detail.id] = { value, processor, isFilled: !!(isValueFilled && processor)  };
  console.log(newActions);
  newActionPossible = actions.some(a => a.isFilled === false) ? true : false;
  actions = newActions;
}


const addAction = () => {
  actions = [...actions, {value: '', processor: '', isFilled: false }];
}

addAction();
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
              <input class="input" type="text" placeholder="Enter Automation Name" bind:value={automationName}>
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
              <textarea class="textarea" placeholder="a description to explain why this automation is in place"  bind:value={automationDescription}></textarea>
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
                  <select bind:value={triggerName}>
                    <option value="">...</option>
                    <option value="title">title contains...</option>
                    <option value="sender">Expeditor contains...</option>
                    <option value="recipient">Recipient contains...</option>
                  </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <svelte:component this={triggerHash[triggerName]} on:input={onTriggerInput} />

      <hr />

      <div>
          <h3 class="title is-5 pb-2">Actions</h3>
      </div>

      {#each actions as action, index}
        <Action actionId={index} on:action={onActionValue} />
      {/each}

      <p class="py-2">
        <button class="button" disabled={!newActionPossible} on:click={() => addAction(true)}>Add new action</button>
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
