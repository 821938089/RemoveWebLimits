/**
 * @typedef Site
 * @prop {string} siteName
 * @prop {string | RegExp} url
 * @prop {string[]} disableEvents
 * @prop {object} wrapperEvents
 */

import { setPropReadOnly } from '../lib'

/**@type {Site} */
const sites = [
  {
    siteName: '起点阅读',
    url: 'https://read.qidian.com/chapter/.*?/.*?/',
    disableEvents: ['copy', 'cut', 'contextmenu', 'error'],
    wrapperEvents: {
      $events: [],
      click(event) {
        const props = [
          'screenX',
          'screenY',
          'clientX',
          'clientY',
          'pageX',
          'pageY',
        ]
        props.forEach(p => setPropReadOnly(event, p, 0))
      },
    },
  },
]

export default sites
