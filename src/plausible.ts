/**
 * Inspired by official Plausible Tracker.
 * @see https://github.com/plausible/analytics/blob/master/tracker/src/customEvents.js#L77
 */

import { sendEvent as _sendEvent, createEventData, isBlackListed, isFile, isUserExcludeItself } from './event'
import { createPayload } from './payload'
import { EventName } from './types'
import type { EventOptions, EventPayload, Plausible, PlausibleOptions } from './types'

/**
 * Create a Plausible tracker.
 * It's a minimal core. Extensions can be used to add more features.
 *
 * @param initOptions - Initial options
 * @returns Plausible tracker
 */
export function createPlausibleTracker(initOptions?: Partial<PlausibleOptions>) {
  const protocol = location.protocol

  const defaultOptions: PlausibleOptions = {
    enabled: true,
    hashMode: false,
    domain: location.hostname,
    apiHost: 'https://plausible.io',
    blackListedDomains: ['localhost'],
    logIgnored: false,
  }

  // Options does not change later.
  const plausibleOptions = { ...defaultOptions, ...initOptions } satisfies PlausibleOptions

  const sendEvent = (payload: EventPayload, callback?: () => void) => _sendEvent(plausibleOptions.apiHost, payload, callback)

  /**
   * Send a custom event.
   *
   * @param eventName - The event name
   * @param options - The event options
   */
  function trackEvent(eventName: string, options?: EventOptions) {
    const data = createEventData(options?.data)
    const payload = createPayload(eventName, plausibleOptions, data, options)

    // Ignore events if the protocol is file, the hostname is blacklisted or the user exclude itself.
    if (isFile(protocol) || isBlackListed(plausibleOptions.domain, plausibleOptions.blackListedDomains) || isUserExcludeItself()) {
      // Only log ignored events if the option is enabled.
      if (!plausibleOptions.logIgnored)
        // eslint-disable-next-line no-console
        console.info(`[Plausible] ${eventName}`, payload)

      // Call the callback if it exists since we are not sending the event.
      options?.callback?.()
    }
    else {
      sendEvent(payload, options?.callback)
    }
  }

  /**
   * Send a pageview event.
   */
  function trackPageview(options?: EventOptions) {
    trackEvent(EventName.Pageview, options)
  }

  return {
    trackEvent,
    trackPageview,
    options: plausibleOptions,
  } satisfies Plausible
}