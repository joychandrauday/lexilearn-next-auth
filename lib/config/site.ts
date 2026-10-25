/**
 * Centralized Site Configuration & Branding for OwlPrep (by Grow With Owl)
 * Modify this file to adjust branding, names, taglines, and metadata globally.
 */

export const siteConfig = {
  name: 'OwlPrep',
  nameBn: 'আউলপ্রেপ',
  fullName: 'OwlPrep — by Grow With Owl',
  parentBrand: 'Grow With Owl',
  letterMark: 'O',
  tagline: 'রাতজাগা স্বপ্নবাজ প্রার্থীদের স্মার্ট চাকরি প্রস্তুতি',
  subTagline: 'বিসিএস, ব্যাংক ও সরকারি চাকরি পরীক্ষার এআই লার্নিং প্ল্যাটফর্ম',
  description:
    'Gamified Spaced Repetition, 1-Minute Micro-Capsules, Smart Question Bank & AI Mentor for BCS, Bank & Career Exams.',
  
  // AI Bot Persona (The Wise Owl)
  bot: {
    name: 'Owl AI',
    nameEn: 'Owl AI',
    nameBn: 'আউল এআই',
    eventTrigger: 'owl_bot:ask',
    legacyEventTrigger: 'lexibot:ask',
    role: 'আপনার সার্বিক বিসিএস, ব্যাংক ও চাকরি প্রস্তুতি এআই মেন্টর',
  },

  // URLs & Contacts
  links: {
    domain: 'growwithowl.com',
    url: 'https://growwithowl.com',
    supportEmail: 'support@growwithowl.com',
    adminEmail: 'admin@growwithowl.com',
    communityEmail: 'community@growwithowl.com',
    guestEmailDomain: 'guest.growwithowl.com',
  },

  // Founder & Architect Info (Author SEO & Backlinks)
  creator: {
    name: 'Joy Chandra Uday',
    nameBn: 'জয় চন্দ্র উদয়',
    role: 'Co-Founder & Systems Architect',
    title: 'Software Engineer & Co-Founder, G2G Digital',
    bio: 'Software engineer and systems architect passionate about high-scale distributed systems, spaced-repetition cognitive algorithms, and execution infrastructure.',
    portfolioUrl: 'https://joychandrauday-nexus.vercel.app/',
    githubUrl: 'https://github.com/joychandrauday',
    linkedinUrl: 'https://www.linkedin.com/in/joychandraudayy/',
    twitterUrl: 'https://twitter.com/joychandrauday',
    facebookUrl: 'https://www.facebook.com/joychandraudayy',
    email: 'joychandraud@gmail.com',
    company: 'G2G Digital',
    companyUrl: 'https://g2gdigital.com',
  },

  // LocalStorage keys with backwards compatibility
  storageKeys: {
    userEmail: 'owl_user_email',
    legacyUserEmail: 'lexi_user_email',
    userName: 'owl_user_name',
    legacyUserName: 'lexi_user_name',
    userInterests: 'owl_user_interests',
    legacyUserInterests: 'lexi_user_interests',
    guestId: 'owl_guest_id',
    legacyGuestId: 'lexi_guest_id',
    authDismissedUntil: 'owl_auth_dismissed_until',
    legacyAuthDismissedUntil: 'lexi_auth_dismissed_until',
    favBaghdhara: 'owl_fav_baghdhara',
    legacyFavBaghdhara: 'lexilearn_fav_baghdhara',
    campaign: 'owl_bcs_campaign',
    legacyCampaign: 'lexilearn_bcs_campaign',
  },

  // Custom Window Event names
  events: {
    requestAuth: 'owl:request_auth',
    legacyRequestAuth: 'lexi:request_auth',
    notebookUpdated: 'owl:notebook_updated',
    legacyNotebookUpdated: 'lexi:notebook_updated',
  },
};

/**
 * Helper to get user email from localStorage supporting current and legacy keys
 */
export function getStoredUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem(siteConfig.storageKeys.userEmail) ||
    localStorage.getItem(siteConfig.storageKeys.legacyUserEmail) ||
    null
  );
}

/**
 * Helper to get user name from localStorage supporting current and legacy keys
 */
export function getStoredUserName(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem(siteConfig.storageKeys.userName) ||
    localStorage.getItem(siteConfig.storageKeys.legacyUserName) ||
    null
  );
}

/**
 * Helper to set stored user email across current and legacy keys for compatibility
 */
export function setStoredUserEmail(email: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(siteConfig.storageKeys.userEmail, email);
  localStorage.setItem(siteConfig.storageKeys.legacyUserEmail, email);
}

/**
 * Helper to set stored user name across current and legacy keys for compatibility
 */
export function setStoredUserName(name: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(siteConfig.storageKeys.userName, name);
  localStorage.setItem(siteConfig.storageKeys.legacyUserName, name);
}

/**
 * Trigger auth modal dialog
 */
export function triggerAuthRequest(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(siteConfig.events.requestAuth));
  window.dispatchEvent(new CustomEvent(siteConfig.events.legacyRequestAuth));
}
