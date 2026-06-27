// ─────────────────────────────────────────────────────────────
// iconMap — maps legacy emoji icons to Ionicons names so the app
// uses a single, consistent monochrome line-icon set (no emoji).
// Use with: <Ionicons name={iconForEmoji(value)} ... />
// ─────────────────────────────────────────────────────────────

const EMOJI_TO_ION = {
  // money / finance
  '💰': 'cash-outline', '💵': 'cash-outline', '💸': 'cash-outline',
  '💳': 'card-outline', '🪙': 'cash-outline',
  '📊': 'stats-chart-outline', '📈': 'trending-up', '📉': 'trending-down',
  '🧾': 'receipt-outline', '🧮': 'calculator-outline',
  // categories
  '🍽': 'restaurant-outline', '🍽️': 'restaurant-outline', '🍔': 'fast-food-outline',
  '☕': 'cafe-outline', '🛒': 'cart-outline', '🛍': 'bag-handle-outline', '🛍️': 'bag-handle-outline',
  '🚗': 'car-outline', '🚕': 'car-outline', '⛽': 'car-sport-outline',
  '🎬': 'film-outline', '🎮': 'game-controller-outline', '🎵': 'musical-notes-outline',
  '🏠': 'home-outline', '🏡': 'home-outline', '💡': 'bulb-outline',
  '📱': 'phone-portrait-outline', '🌐': 'globe-outline', '✈️': 'airplane-outline',
  '🏥': 'medkit-outline', '🎓': 'school-outline', '🏷': 'pricetag-outline', '🏷️': 'pricetag-outline',
  // banking / institutions
  '🏦': 'business-outline', '🏛': 'business-outline', '🏛️': 'business-outline',
  '🔴': 'business-outline', '🟠': 'business-outline', '🟡': 'business-outline',
  '🟢': 'business-outline', '🔵': 'business-outline',
  // security
  '🛡': 'shield-checkmark-outline', '🛡️': 'shield-checkmark-outline',
  '🔒': 'lock-closed-outline', '🔐': 'lock-closed-outline', '🔑': 'key-outline',
  '🔗': 'link-outline', '📄': 'document-text-outline', '📋': 'clipboard-outline',
  // status / feedback
  '✅': 'checkmark-circle', '✔️': 'checkmark', '✓': 'checkmark',
  '❌': 'close-circle', '✕': 'close', '✗': 'close',
  '⚠️': 'warning-outline', '⚠': 'warning-outline', '❓': 'help-circle-outline',
  '💥': 'alert-circle-outline', '🔄': 'refresh', '⚡': 'flash-outline',
  // AI / assistant / insights
  '🤖': 'sparkles', '✨': 'sparkles-outline', '💬': 'chatbubble-ellipses-outline',
  '💡✨': 'sparkles-outline', '🧠': 'sparkles-outline', '🧪': 'flask-outline',
  // health / goals
  '💚': 'pulse-outline', '❤️': 'heart-outline', '🎯': 'flag-outline', '🏁': 'flag-outline',
  '🚀': 'rocket-outline', '🌟': 'star', '⭐': 'star', '💎': 'diamond-outline',
  // rewards / tiers
  '🎁': 'gift-outline', '🥇': 'medal-outline', '🥈': 'medal-outline', '🥉': 'medal-outline',
  '🏆': 'trophy-outline',
  // people / profile / nav
  '👤': 'person', '👥': 'people-outline', '🔔': 'notifications-outline',
  '🔍': 'search-outline', '⚙️': 'settings-outline', '⚙': 'settings-outline',
  '🚪': 'log-out-outline', '✏️': 'pencil', '✏': 'pencil', '📅': 'calendar-outline',
  '🌙': 'moon-outline', '👛': 'wallet-outline', '👜': 'bag-outline',
  '👁️': 'eye-outline', '👁': 'eye-outline', '🙈': 'eye-off-outline',
  // arrows / chevrons
  '←': 'arrow-back', '→': 'arrow-forward', '➡️': 'arrow-forward', '➡': 'arrow-forward',
  '↑': 'arrow-up', '↓': 'arrow-down', '↗': 'arrow-up', '›': 'chevron-forward', '‹': 'chevron-back',
};

const DEFAULT_ICON = 'ellipse-outline';

/** Strip the FE0F variation selector and surrounding spaces, then look up. */
export const iconForEmoji = (value) => {
  if (!value) return DEFAULT_ICON;
  const key = String(value).replace(/️/g, '').trim();
  return EMOJI_TO_ION[key] || EMOJI_TO_ION[String(value).trim()] || DEFAULT_ICON;
};

export default iconForEmoji;
