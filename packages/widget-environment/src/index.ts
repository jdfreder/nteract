import { createShimMessageSubject } from './shim-message-subject';
import { WidgetManager } from './widget-manager';

const el = document.createElement('div');
el.innerText = 'Shim loaded. Loading jupyter-widgets...';
document.body.appendChild(el);

const widgetContainer =  document.createElement('div');
document.body.appendChild(widgetContainer);

async function main() {
  const messages = createShimMessageSubject(window);
  el.innerText += '\nCreating widget-manager...';
  const manager = new WidgetManager(messages, widgetContainer);
  el.innerText += '\nActivating...';
  await manager.activate();
  el.innerText += '\nDone.';
}

main();
