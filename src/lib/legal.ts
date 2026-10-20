export const STUDIO_NAME = '스튜디오 쾁쾁';
export const SUPPORT_EMAIL = 'studio.qwapqwap@gmail.com';
export const POLICY_VERSION = '2026-10-20';
export const POLICY_DATE = '2026년 10월 20일';
export type RegistrationConsent = { ageConfirmed: boolean; termsAccepted: boolean; privacyAccepted: boolean };
export const EMPTY_REGISTRATION_CONSENT: RegistrationConsent = { ageConfirmed: false, termsAccepted: false, privacyAccepted: false };
export function hasRegistrationConsent(value: RegistrationConsent) {
  return value.ageConfirmed && value.termsAccepted && value.privacyAccepted;
}
