const FIREBASE_ERROR_MAP: Record<string, string> = {
  "auth/user-not-found": "No account found with this email address.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/email-already-in-use": "An account with this email already exists. Try signing in.",
  "auth/weak-password": "Password must be at least 6 characters long.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled": "This account has been disabled. Contact support.",
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/network-request-failed": "Network error. Check your internet connection.",
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
  "auth/popup-blocked": "Pop-up was blocked by your browser. Please allow pop-ups.",
  "auth/cancelled-popup-request": "Another sign-in is already in progress.",
  "auth/account-exists-with-different-credential": "An account already exists with a different sign-in method. Try Google or email.",
  "auth/invalid-credential": "Invalid credentials. Please check and try again.",
  "auth/operation-not-allowed": "This sign-in method is not enabled.",
  "auth/requires-recent-login": "Please sign out and sign in again to complete this action.",
  "auth/invalid-verification-code": "Invalid OTP code. Please check and try again.",
  "auth/invalid-phone-number": "Invalid phone number. Include your country code (e.g. +91).",
  "auth/missing-phone-number": "Please enter your phone number.",
  "auth/quota-exceeded": "SMS quota exceeded. Try again later.",
  "auth/session-expired": "OTP expired. Please request a new one.",
  "auth/code-expired": "Verification code expired. Request a new OTP.",
  "auth/captcha-check-failed": "reCAPTCHA check failed. Please refresh and try again.",
  "auth/missing-verification-code": "Please enter the verification code.",
  "auth/credential-already-in-use": "This account is already linked to another user.",
  "auth/email-change-needs-verification": "Please verify your new email address.",
  "auth/unverified-email": "Please verify your email address first.",
  "auth/invalid-action-code": "This link has expired or already been used.",
  "auth/expired-action-code": "This verification link has expired. Request a new one.",
};

export function mapFirebaseError(error: any): string {
  if (!error) return "An unexpected error occurred.";
  const code = error?.code as string;
  if (code && FIREBASE_ERROR_MAP[code]) return FIREBASE_ERROR_MAP[code];
  const msg = error?.message || "";
  if (msg.includes("INVALID_LOGIN_CREDENTIALS")) return "Incorrect email or password.";
  if (msg.includes("TOO_MANY_ATTEMPTS")) return "Too many failed attempts. Try again later.";
  if (msg.includes("BLOCKING_FUNCTION_ERROR")) return "Sign-up blocked. Use a valid email and phone number.";
  return msg || "An unexpected error occurred. Please try again.";
}

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com","guerrillamail.com","guerrillamail.info","guerrillamail.biz",
  "guerrillamail.de","guerrillamail.net","guerrillamail.org","guerrillamailblock.com",
  "grr.la","sharklasers.com","spam4.me","yopmail.com","yopmail.fr","cool.fr.nf",
  "jetable.fr.nf","nospam.ze.tc","nomail.xl.cx","mega.zik.dj","speed.1s.fr",
  "courriel.fr.nf","moncourrier.fr.nf","monemail.fr.nf","monmail.fr.nf",
  "trashmail.com","trashmail.at","trashmail.io","trashmail.me","trashmail.net",
  "trashmail.org","trashmailer.com","trash-mail.at","trash-mail.com",
  "dispostable.com","mailnull.com","spamcorpse.com","spamfree24.org","spamfree24.de",
  "spamfree24.eu","spamfree24.info","spamfree24.net","spamgob.com",
  "throwam.com","throwaway.email","fakeinbox.com","mailexpire.com",
  "maildrop.cc","mailnesia.com","tempinbox.com","mailtemporaire.com",
  "discard.email","discardmail.com","discardmail.de","spamfree.eu",
  "spam.la","spam.su","xagloo.com","einrot.com","fleckens.hu",
  "superrito.com","naivemailinator.com","tempail.com","spambog.com",
  "spambog.de","spambog.ru","e4ward.com","mailnew.com","mail-temp.com",
  "10minutemail.com","10minutemail.net","10minutemail.org","10minutemail.co.uk",
  "20minutemail.com","filzmail.com","odaymail.com","mohmal.com","boun.cr",
  "spamspot.com","temporaryemail.net","mailsac.com","temp.email","tempr.email",
  "getairmail.com","notmailinator.com","tempmail.net",
  "tempmail.org","tempmail.us","tempemail.com","teml.net","tmail.com",
  "tmailinator.com","mailmetrash.com","itrashmail.com","mailforspam.com",
  "mailin8r.com","mailinator.net","mailinator2.com","dispostable.net",
  "getnada.com","harakirimail.com","incognitomail.com","inoutmail.com",
  "inoutmail.de","inoutmail.eu","inoutmail.info","koszmail.pl","kurzepost.de",
  "letthemeatspam.com","lol.ovpn.to","lortemail.dk","losemymail.com",
]);

export function isTempEmail(email: string): boolean {
  if (!email || !email.includes("@")) return false;
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return false;
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) return true;
  if (domain.includes("mailinator") || domain.includes("guerrilla") ||
      domain.includes("tempmail") || domain.includes("throwaway") ||
      domain.includes("trashmail") || domain.includes("spamgourmet") ||
      domain.includes("yopmail") || domain.includes("discard") ||
      domain.includes("fakeinbox") || domain.includes("maildrop") ||
      domain.includes("mailnesia") || domain.includes("getnada")) {
    return true;
  }
  return false;
}

const VOIP_PREFIXES = [
  "1900","1800","1844","1855","1866","1877","1888",
];

export function isTempPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  for (const prefix of VOIP_PREFIXES) {
    if (digits.startsWith(prefix)) return true;
  }
  return false;
}

export function validatePasswordStrength(password: string): { valid: boolean; message: string } {
  if (password.length < 8) return { valid: false, message: "Password must be at least 8 characters." };
  if (!/[A-Z]/.test(password) && !/[0-9]/.test(password))
    return { valid: false, message: "Add a number or capital letter to make it stronger." };
  return { valid: true, message: "" };
}
