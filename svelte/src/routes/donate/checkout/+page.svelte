<script>
	/**
	 * Blackbaud's donation form, embedded. Its loader swaps the div for an
	 * iframe it hosts, so the form's look is set in Raiser's Edge NXT, not
	 * here, and passes this page's URL parameters (onetimeamt, rgamt) on to
	 * pre-fill it. The loader only scans the page when it loads, so links
	 * here need a full page load (data-sveltekit-reload).
	 */
	const ENVIRONMENT_ID = 'p-6kCP9hPcsUaVDCsZ4lZRiw';
	const FORM_ID = '71761ff0-b974-4aac-9452-2dc76190612c';

	let { data } = $props();
</script>

<svelte:head>
	<script
		src="https://sky.blackbaudcdn.net/static/og-web-loader/1/main.js"
		data-envid={ENVIRONMENT_ID}
		data-zone="usa"
	></script>
</svelte:head>

<h1 class="sr-only">{data.navTitle}</h1>

<div
	data-blackbaud-standard-form-id={FORM_ID}
	data-svc-id="renxt"
	class="mx-auto w-full max-w-[60rem] pt-page-top pb-page-bottom"
></div>
