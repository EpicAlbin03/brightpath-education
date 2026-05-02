export function useCookieConsent() {
	const cookieConsent = useCookie<boolean | null>('cookie_consent', {
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 365 * 10
	});
	const shouldShowCookieConsent = computed(() => cookieConsent.value == null);

	function setCookieConsent(value: boolean) {
		cookieConsent.value = value;
	}

	function acceptCookieConsent() {
		setCookieConsent(true);
	}

	function declineCookieConsent() {
		setCookieConsent(false);
	}

	return {
		cookieConsent,
		shouldShowCookieConsent,
		setCookieConsent,
		acceptCookieConsent,
		declineCookieConsent
	};
}
