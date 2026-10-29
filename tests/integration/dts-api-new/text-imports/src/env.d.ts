/// <reference types="@rslib/core/types" />

declare module '*' with { type: 'text' } {
  const content: string;
  export default content;
}
