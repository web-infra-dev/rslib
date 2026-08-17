import { render } from './render';

export default async function renderPage(pathname: string): Promise<string> {
  return render(pathname);
}
