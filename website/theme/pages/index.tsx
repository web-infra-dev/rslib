import { BackgroundImage } from '@rstack-dev/doc-ui/background-image';
import { CopyRight } from '../components/Copyright';
import { Hero } from '../components/Hero';
import { ToolStack } from '../components/ToolStack';

export function HomeLayout() {
  return (
    <div style={{ position: 'relative' }}>
      <BackgroundImage />
      <Hero />
      <ToolStack />
      <CopyRight />
    </div>
  );
}
