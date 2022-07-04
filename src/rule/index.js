import { toRE } from '../lib'
import sites from './sites'

/**
 * @typedef {import('./sites').Site} Site
 */

/**
 * 获取站点信息
 * @returns {Site}
 */
function getSiteInfo() {
  const { href } = location
  return sites.find(({ url }) => url && toRE(url).test(href))
}

export { getSiteInfo }
