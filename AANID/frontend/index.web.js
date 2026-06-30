window.onerror = function(msg, url, line, col, err) {
  document.getElementById('root').innerHTML = '<pre style="color:red;padding:20px;font-size:14px;white-space:pre-wrap">Error: ' + msg + '\n' + (err && err.stack || '') + '</pre>';
  return true;
};
window.addEventListener('unhandledrejection', function(e) {
  document.getElementById('root').innerHTML = '<pre style="color:red;padding:20px;font-size:14px;white-space:pre-wrap">Unhandled Rejection: ' + (e.reason && e.reason.message || e.reason) + '\n' + (e.reason && e.reason.stack || '') + '</pre>';
});

import './src/global.css';

import { AppRegistry } from 'react-native';
import centuryGothicUrl from './assets/fonts/CenturyGothic.ttf';
import App from './App';
import { name as appName } from './app.json';

const style = document.createElement('style');
style.textContent = `
  @font-face {
    font-family: 'Ionicons';
    src: url('https://cdnjs.cloudflare.com/ajax/libs/ionicons/2.0.1/fonts/ionicons.ttf') format('truetype');
  }
  @font-face {
    font-family: 'CenturyGothic';
    src: url('${centuryGothicUrl}') format('truetype');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }
  body, #root { font-family: 'CenturyGothic', system-ui, -apple-system, sans-serif; }
`;
document.head.appendChild(style);

AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
