declare module 'chart.js' {
  export interface Chart {
    update(): void;
  }
}

declare module 'three/addons/controls/OrbitControls.js' {
  export interface OrbitControls {
    update(): void;
  }
}

declare module 'pkg/sub.mjs' {
  export type EsmValue = string;
}

declare module 'pkg/sub.cjs' {
  export type CjsValue = string;
}
