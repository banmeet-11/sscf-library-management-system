import { useSyncExternalStore } from 'react'
import { subscribe, getState } from './store'

// Subscribe a component to the whole store. `selector` picks the slice it needs.
export function useStore(selector = (s) => s) {
  return useSyncExternalStore(subscribe, () => selector(getState()))
}
