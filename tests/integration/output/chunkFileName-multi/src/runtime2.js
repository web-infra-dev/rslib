import dep from './runtime-dep.cjs';

export const value = dep.value;
export const loadShared = () => import('./shared.js');
