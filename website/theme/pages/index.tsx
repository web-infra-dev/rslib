import { HomeBackground as BasicHomeBackground } from '@rspress/core/theme';
import { BackgroundImage } from '@rstack-dev/doc-ui/background-image';
import { CopyRight } from '../components/Copyright';
import { Hero } from '../components/Hero';
import { ToolStack } from '../components/ToolStack';

function HomeBackground() {
  return (
    <>
      {/* For transparent nav at top */}
      <BasicHomeBackground style={{ background: 'none' }} />
      <BackgroundImage />
    </>
  );
}

export function HomeLayout() {
  return (
    <div style={{ position: 'relative' }}>
      <HomeBackground />
      <Hero />
      <ToolStack />
      <CopyRight />
    </div>
  );
}
