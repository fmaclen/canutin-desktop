<script lang="ts">
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	import { onMount } from 'svelte';
	import type { Event } from '@prisma/client';

	import { Appearance, EventStatus, ONE_SECOND_IN_MS } from '$lib/helpers/constants';
	import { api } from '$lib/helpers/misc';

	// HACK: only way `svelte-toast` can render HTML around the message in a toast.
	// This implementation adds a loading icon next to the message.
	const addLoadingIcon = (message: string) => {
		return `
			<div class="toastLoadingMsg">
				<!-- By Sam Herbert (@sherb), for everyone. More @ http://goo.gl/7AJzbL -->
				<svg class="toastLoadingMsg__icon" width="38" height="38" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#fff">
						<g fill="none" fill-rule="evenodd">
								<g transform="translate(1 1)" stroke-width="2">
										<circle stroke-opacity=".5" cx="18" cy="18" r="18"/>
										<path d="M36 18c0-9.94-8.06-18-18-18">
												<animateTransform
														attributeName="transform"
														type="rotate"
														from="0 18 18"
														to="360 18 18"
														dur="1s"
														repeatCount="indefinite"/>
										</path>
								</g>
						</g>
				</svg>
	
				<p class="toastLoadingMsg__p">
					${message}
				</p>
			</div>
		`;
	};

	const setColorTheme = (appearance: Appearance | null) => {
		switch (appearance) {
			case Appearance.ACTIVE:
				return {
					classes: ['toastLi', 'toastLi--active'],
					theme: { '--toastBackground': 'var(--color-bluePrimary)' }
				};
			case Appearance.POSITIVE:
				return {
					classes: ['toastLi', 'toastLi--positive'],
					theme: { '--toastBackground': 'var(--color-greenPrimary)' }
				};
			case Appearance.NEGATIVE:
				return {
					classes: ['toastLi', 'toastLi--negative'],
					theme: { '--toastBackground': 'var(--color-redPrimary)' }
				};
			default:
				return {
					classes: ['toastLi'],
					theme: { '--toastBackground': 'var(--color-black-alpha65)' }
				};
		}
	};

	const ongoingEvents: [number, number][] = []; // Queue of ongoing events

	const getEvents = async () => {
		const events: Event[] = await api({ endpoint: 'event' });

		// Remove old events from the ongoing events and toast queues
		for (const [toastId, eventId] of ongoingEvents) {
			if (events.some((event) => event.id === eventId)) continue;

			toast.pop(toastId);
			ongoingEvents.splice(ongoingEvents.indexOf([toastId, eventId]), 1);
		}

		// Push new events to the toast queue
		for (const event of events) {
			// Skip events that are already in the ongoing events queue
			if (ongoingEvents.some((activeEventId) => activeEventId[1] === event.id)) continue;

			const shouldAutoDismiss = event.dismissAfter !== 0;
			const isEventOngoing = event.status === EventStatus.ONGOING;

			const toastId = toast.push(isEventOngoing ? addLoadingIcon(event.message) : event.message, {
				initial: shouldAutoDismiss ? 1 : 0,
				duration: shouldAutoDismiss ? event.dismissAfter : undefined,
				reversed: true,
				dismissable: !isEventOngoing,
				...setColorTheme(event.appearance as Appearance | null)
			});

			// Push ongoing events to the ongoing events queue
			if (isEventOngoing) ongoingEvents.push([toastId, event.id]);
		}

		// Poll the API every second
		setTimeout(async () => {
			// Recursively call the function
			getEvents();
		}, ONE_SECOND_IN_MS);
	};

	onMount(() => {
		getEvents();
	});
</script>

<div class="toastContainer">
	<SvelteToast />

	<!-- 
		HACK: The following elements supresses the SvelteKit warning `No scopable elements
		found in template` because it's unaware we are injecting the actual elements into
		<SvelteToast />. We hide these elements with a CSS modifier.
	-->
	<div class="toastLoadingMsg toastLoadingMsg--hidden" />
	<p class="toastLoadingMsg__p toastLoadingMsg__p--hidden" />
	<svg class="toastLoadingMsg__icon toastLoadingMsg__icon--hidden" />
</div>

<style lang="scss">
	:global(._toastContainer) {
		--toastContainerTop: none;
		--toastContainerBottom: 64px;
		--toastContainerRight: 16px;

		display: flex;
		flex-direction: column;
		gap: 8px;
		font-size: 12px;
	}

	:global(._toastItem) {
		--toastMargin: 0;
		--toastBorderRadius: 4px;
		--toastMinHeight: 0;
		--toastPadding: 0;
		--toastColor: var(--color-white);
	}

	:global(._toastBar) {
		--toastBarTop: 0;
		--toastBarRight: 0;
		--toastBarHeight: 100%;
		--toastBarBackground: var(--color-white-alpha10);
	}

	:global(._toastMsg) {
		--toastMsgPadding: 12px;
	}

	:global(div.toastLoadingMsg) {
		display: flex;
		column-gap: 8px;
		flex-direction: row-reverse;
		justify-content: space-between;
	}

	:global(svg.toastLoadingMsg__icon) {
		width: 16px;
		height: 16px;
	}

	:global(p.toastLoadingMsg__p) {
		margin: 0;
	}

	div.toastLoadingMsg,
	p.toastLoadingMsg__p,
	svg.toastLoadingMsg__icon {
		&--hidden {
			display: none;
		}
	}
</style>
