const CHECKOUT_ORIGINS_KEY = 'shopify-buy-ui-checkout-origins';

function originFromUrl(url) {
  if (!url) {
    return null;
  }
  const anchor = document.createElement('a');
  anchor.href = url;
  if (!anchor.protocol || !anchor.hostname) {
    return null;
  }
  const isDefaultPort = (anchor.protocol === 'https:' && anchor.port === '443') ||
    (anchor.protocol === 'http:' && anchor.port === '80');
  const port = anchor.port && !isDefaultPort ? `:${anchor.port}` : '';
  return `${anchor.protocol}//${anchor.hostname}${port}`;
}

function readCheckoutOrigins() {
  try {
    const origins = JSON.parse(window.sessionStorage.getItem(CHECKOUT_ORIGINS_KEY));
    return Array.isArray(origins) ? origins : [];
  } catch (err) {
    return [];
  }
}

/**
 * Records the origin of a checkout URL that was opened in a popup.
 * The origin is kept in sessionStorage, so it is still known after the page reloads.
 * @param {String} url - checkout URL the popup was sent to.
 */
export function trackCheckoutUrl(url) {
  const origin = originFromUrl(url);
  const origins = readCheckoutOrigins();
  if (!origin || origins.indexOf(origin) !== -1) {
    return;
  }
  origins.push(origin);
  try {
    window.sessionStorage.setItem(CHECKOUT_ORIGINS_KEY, JSON.stringify(origins));
  } catch (err) {
    // sessionStorage is not available. Messages from the configured shop domain are still trusted.
  }
}

/**
 * Removes the recorded checkout origins.
 */
export function clearCheckoutOrigins() {
  try {
    window.sessionStorage.removeItem(CHECKOUT_ORIGINS_KEY);
  } catch (err) {
    // sessionStorage is not available, so there is nothing to remove.
  }
}

/**
 * Checks that a `message` event was sent by a checkout popup that this page opened.
 * The sender must be a popup whose `opener` is this window, and the message must come from
 * a recorded checkout origin or from the shop's configured domain.
 * Both checks still work after this page reloads.
 * @param {MessageEvent} msg - message event received by the host window.
 * @param {String} domain - shop domain configured on the client.
 * @return {Boolean} true when the sender is a checkout popup that this window opened.
 */
export function isCheckoutPopupMessage(msg, domain) {
  const source = msg && msg.source;
  if (!source || source === window || source.opener !== window || !msg.origin) {
    return false;
  }
  const trustedOrigins = readCheckoutOrigins();
  if (domain) {
    trustedOrigins.push(originFromUrl(`https://${domain}`));
  }
  return trustedOrigins.indexOf(msg.origin) !== -1;
}
