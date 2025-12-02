export interface PluginInstance {
  apply: (compiler: any) => void;
  [index: string]: any;
}
