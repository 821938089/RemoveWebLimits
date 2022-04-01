// import { getGreetings } from './app';

// document.body.append(VM.m(getGreetings()));

import App from './app';
import { toggleConsole } from './log';

toggleConsole(true)

App.init();