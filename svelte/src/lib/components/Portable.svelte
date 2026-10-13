<script>
	import { PortableText } from '@portabletext/svelte';
	import PortableLink from '$lib/components/PortableLink.svelte';

	const { value } = $props();

	const components = { marks: { link: PortableLink } };
</script>

<PortableText {value} {components} />
