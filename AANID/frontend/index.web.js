import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

const style = document.createElement('style');
style.textContent = `
  @font-face {
    font-family: 'Ionicons';
    src: url('https://cdnjs.cloudflare.com/ajax/libs/ionicons/2.0.1/fonts/ionicons.ttf') format('truetype');
  }
`;
document.head.appendChild(style);

AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
