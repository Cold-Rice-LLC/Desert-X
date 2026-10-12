<script>
	import { PortableText } from '@portabletext/svelte';
	import PortableLink from '$lib/components/PortableLink.svelte';

	const { value } = $props();

	const components = { hardBreak: null, marks: { link: PortableLink } };
</script>

<PortableText {value} {components} />
