<script>
	import ModuleHeading from '$lib/components/modules/ModuleHeading.svelte';
	import Portable from '$lib/components/Portable.svelte';

	/**
	 * Optional centred heading and text over the Mailchimp newsletter
	 * signup: an email field over a grey rule, as search's, and Sign Up.
	 * Mailchimp's answer shows underneath, through its JSONP endpoint, so
	 * the visitor stays on the page; without JavaScript the form posts to
	 * Mailchimp in a new tab, as its embed does.
	 */
	let { module } = $props();

	const action =
		'https://desertx.us11.list-manage.com/subscribe/post?u=95ae113010d7508c504df5c4b&id=b41070a382';
	// Mailchimp's bot trap: a field people never see, so only bots fill it
	const trap = 'b_95ae113010d7508c504df5c4b_b41070a382';

	let email = $state('');
	let sending = $state(false);
	let message = $state('');

	// Mailchimp only answers in JSONP: a script calling the named function
	const jsonp = (url) =>
		new Promise((resolve, reject) => {
			const callback = `mailchimp${Date.now()}`;
			const script = document.createElement('script');
			const done = () => {
				delete window[callback];
				script.remove();
			};
			window[callback] = (data) => {
				done();
				resolve(data);
			};
			script.onerror = () => {
				done();
				reject();
			};
			url.searchParams.set('c', callback);
			script.src = url;
			document.head.append(script);
		});

	async function subscribe(event) {
		event.preventDefault();
		const url = new URL(action.replace('/post?', '/post-json?'));
		url.searchParams.set('EMAIL', email);
		url.searchParams.set(trap, event.currentTarget.elements[trap].value);
		sending = true;
		try {
			const { result, msg } = await jsonp(url);
			// Its messages can start with an error code and end in a link
			// to update a profile, which wouldn't work out of context
			message = msg
				.split('<a')[0]
				.replace(/<[^>]*>/g, '')
				.replace(/^\d+ - /, '');
			if (result === 'success') email = '';
		} catch {
			message = 'Something went wrong. Please try again.';
		}
		sending = false;
	}
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
		onsubmit={subscribe}
		class="flex items-center gap-[0.6em] border-b-2 border-grey-3 pb-xs"
	>
		<input
			type="email"
			name="EMAIL"
			required
			placeholder="Email address"
			aria-label="Email address"
			bind:value={email}
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
		<button disabled={sending} class="uppercase link-fade">Sign up</button>
	</form>

	<!-- Always there, so screen readers announce what arrives in it -->
	<p role="status" class="empty:hidden">{message}</p>
</div>
