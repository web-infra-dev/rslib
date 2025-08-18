// @ts-expect-error ignore remote module type check for passing ci run build because we set @mf-types folder in .gitignore
import { Counter } from 'rslib-module';

const Component = () => <Counter />;

export default {
  title: 'App Component',
  component: Component,
};

export const Primary = {};
