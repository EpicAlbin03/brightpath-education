<script setup lang="ts">
import PageTitle from '~/components/PageTitle.vue';
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCookieConsent } from '~/composables/useCookieConsent';

useSeoMeta({
	title: 'Settings | BrightPath Education',
	description: 'Manage BrightPath Education account preferences and application settings.'
});

const { cookieConsent, setCookieConsent } = useCookieConsent();

function handleCookieConsentChange(value: boolean | 'indeterminate') {
	setCookieConsent(value === true);
}
</script>

<template>
	<section class="space-y-6">
		<PageTitle title="Settings" description="Manage your account settings and preferences" />

		<Tabs default-value="preferences" class="gap-5">
			<TabsList>
				<TabsTrigger value="profile" disabled>Profile</TabsTrigger>
				<TabsTrigger value="preferences">Preferences</TabsTrigger>
				<TabsTrigger value="appearance" disabled>Appearance</TabsTrigger>
			</TabsList>

			<TabsContent value="preferences">
				<div class="rounded-xl border border-border/70 bg-card/60 p-4 shadow-sm">
					<div class="mb-5 space-y-1.5">
						<h2 class="text-lg font-semibold tracking-tight text-foreground">Preferences</h2>
						<p class="text-sm text-muted-foreground">
							Manage the cookie preference stored by this application.
						</p>
					</div>

					<Field orientation="horizontal" class="flex flex-wrap gap-8">
						<FieldContent>
							<FieldLabel for="cookie-consent"> Cookie consent </FieldLabel>
							<FieldDescription class="max-w-md">
								Agree to our use of cookies. Agree to our use of cookies. Agree to our use of
								cookies.
							</FieldDescription>
						</FieldContent>
						<Switch
							id="cookie-consent"
							:model-value="cookieConsent === true"
							aria-label="Enable cookie consent"
							class="mt-1"
							@update:model-value="handleCookieConsentChange"
						/>
					</Field>
				</div>
			</TabsContent>
		</Tabs>
	</section>
</template>
