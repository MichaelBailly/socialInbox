export default class Automation {
  constructor({ _id, name, description, trigger, actions }) {
    this._id = _id;
    this.name = name;
    this.description = description;
    this.trigger = trigger;
    this.actions = actions;
  }

  id() {
    return this._id;
  }

  setId(id) {
    this._id = id;
  }

  static fromObject({ _id, name, description, trigger, actions }) {
    if (!name || typeof name !== 'string' || !name.trim().length) {
      throw new Error('Automation name should be a non empty string');
    }
    if (typeof description !== 'string') {
      throw new Error('Automation description should be a string');
    }
    if (!Array.isArray(actions) || !actions.length) {
      throw new Error('Automation actions should be a non null array');
    }

    const automation = {
      name: name.trim(),
      description: description.trim(),
      trigger: AutomationTrigger.fromObject(trigger),
      actions: actions.map(AutomationAction.fromObject),
    };
    if (_id) {
      automation._id = _id;
    }
    return new Automation(automation);
  }
}

export class AutomationTrigger {
  constructor({ processor, value }) {
    this.processor = processor;
    this.value = value;
  }

  static fromObject({ processor, value }) {
    if (
      !processor ||
      typeof processor !== 'string' ||
      !processor.trim().length
    ) {
      throw new Error(
        'AutomationTrigger processor should be a non empty string'
      );
    }
    if (!value || typeof value !== 'string' || !value.trim().length) {
      throw new Error('AutomationTrigger name should be a non empty string');
    }

    return new AutomationTrigger({
      processor: processor.trim(),
      value: value.trim(),
    });
  }
}

export class AutomationAction {
  constructor({ processor, value }) {
    this.processor = processor;
    this.value = value;
  }

  static fromObject({ processor, value }) {
    if (
      !processor ||
      typeof processor !== 'string' ||
      !processor.trim().length
    ) {
      throw new Error(
        'AutomationAction processor should be a non empty string'
      );
    }
    if (!value) {
      throw new Error('AutomationAction value should be non nullish');
    }
    if (
      (typeof value === 'string' && !value.trim().length) ||
      (Array.isArray(value) && !value.length)
    ) {
      throw new Error(
        'AutomationAction value should be a non null string or a non empty array'
      );
    }

    return new AutomationAction({
      processor: processor.trim(),
      value: typeof value === 'string' ? value.trim() : value,
    });
  }
}
