import type { AppUserSettings } from '~~/shared/types';

export function useUserSettings() {
	const { user } = useAuth();
	const cookieBannerDismissed = useState<boolean>(
		'user-settings:cookie-banner-dismissed',
		() => false
	);
	const isSaving = useState<boolean>('user-settings:saving', () => false);
	const settingsUserId = useState<number | null>('user-settings:user-id', () => null);
	const {
		data: settings,
		pending,
		error,
		refresh
	} = useFetch<AppUserSettings>('/api/auth/me/settings/', {
		key: 'auth-me-settings'
	});

	const loading = computed(() => pending.value || isSaving.value);
	const loaded = computed(() => settings.value != null || error.value != null);
	const cookieConsent = computed<boolean | null>(() => settings.value?.cookie_consent ?? null);
	const shouldShowCookieConsent = computed(
		() => loaded.value && cookieConsent.value === null && !cookieBannerDismissed.value
	);

	watch(
		() => user.value?.id ?? null,
		(currentUserId) => {
			if (settingsUserId.value === currentUserId) {
				return;
			}

			settingsUserId.value = currentUserId;
			cookieBannerDismissed.value = false;
			settings.value = undefined;

			if (currentUserId != null) {
				void refresh();
			}
		},
		{ immediate: true }
	);

	async function updateSettings(patch: Partial<AppUserSettings>) {
		isSaving.value = true;

		try {
			settings.value = await $fetch<AppUserSettings>('/api/auth/me/settings/', {
				method: 'PATCH',
				body: patch
			});
			return settings.value;
		} finally {
			isSaving.value = false;
		}
	}

	async function setCookieConsent(value: boolean) {
		cookieBannerDismissed.value = true;
		return await updateSettings({ cookie_consent: value });
	}

	async function acceptCookieConsent() {
		return await setCookieConsent(true);
	}

	async function declineCookieConsent() {
		return await setCookieConsent(false);
	}

	return {
		settings,
		loading,
		error,
		loaded,
		cookieConsent,
		shouldShowCookieConsent,
		refreshSettings: refresh,
		updateSettings,
		setCookieConsent,
		acceptCookieConsent,
		declineCookieConsent
	};
}
