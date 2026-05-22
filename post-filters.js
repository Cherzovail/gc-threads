import { state } from './state.js';

export function getActiveConcernCategory() {
  return state.activeConcernCategory || 'All';
}

export function setActiveConcernCategory(category) {
  state.activeConcernCategory = category || 'All';
}

