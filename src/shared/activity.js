export const isActivity = (object) => {
  if (!object) {
    return false;
  }
  if (!object.name || typeof object.name !== 'string') {
    return false;
  }
  if (!object.actor || !object.actor.origin || !object.actor._id) {
    return false;
  }
  if (!object.date) {
    return false;
  }
  return true;
};
