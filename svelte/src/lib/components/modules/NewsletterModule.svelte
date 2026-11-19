<script>
	import ModuleHeading from '$lib/components/modules/ModuleHeading.svelte';
	import Portable from '$lib/components/Portable.svelte';

	/**
	 * Optional centred heading and text over the Mailchimp newsletter
	 * signup: an email field over a grey rule, black while it has keyboard
	 * focus, as search's, and Sign Up. It posts to Mailchimp in a new tab,
	 * as its embed and the old site's footer do, and Mailchimp's page there
	 * confirms the signup or asks what it needs.
	 */
	let { module } = $props();

	const action =
		'https://desertx.us11.list-manage.com/subscribe/post?u=95ae113010d7508c504df5c4b&id=b41070a382';
	// Mailchimp's bot trap: a field people never see, so only bots fill it
	const trap = 'b_95ae113010d7508c504df5c4b_b41070a382';
</script>

<div class="space-y-line px-module">
	<ModuleHeading heading={module.heading} />
	{#if module.text}
		<Portable value={module.text} />
	{/if}

	<form
		{action}
		method="post"
		target="_blank"
		class="flex items-center gap-[0.6em] border-b-2 border-grey-3 pb-xs keyboard:has-[input:focus-visible]:border-black"
	>
		<input
			type="email"
			name="EMAIL"
			required
			autocomplete="email"
			placeholder="Email address"
			aria-label="Email address"
			class="min-w-0 flex-1 outline-none placeholder:text-grey-3"
		/>
		<input
			type="text"
			name={trap}
			tabindex="-1"
			autocomplete="off"
			aria-hidden="true"
			class="sr-only"
		/>
		<button class="uppercase link-fade">Sign up</button>
	</form>
</div>
