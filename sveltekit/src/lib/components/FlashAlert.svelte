<script lang="ts">
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	import { onMount } from 'svelte';
	import type { Event } from '@prisma/client';

	import { Appearance, EventStatus } from '$lib/helpers/constants';
	import { api } from '$lib/helpers/misc';

	// HACK: only `svelte-toast` can render HTML around the message in a toast.
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

	const getColorTheme = (appearance: Appearance) => {
		switch (appearance) {
			case Appearance.ACTIVE:
				return { '--toastBackground': 'var(--color-bluePrimary)' };
			case Appearance.POSITIVE:
				return { '--toastBackground': 'var(--color-greenPrimary)' };
			case Appearance.NEGATIVE:
				return { '--toastBackground': 'var(--color-redPrimary)' };
			default:
				return { '--toastBackground': 'var(--color-black-alpha65)' };
		}
	};

	const ONE_SECOND_IN_MILLISECONDS = 1000;

	const ongoingEvents: [number, number][] = [];

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
			if (ongoingEvents.some((activeEventId) => activeEventId[1] === event.id)) continue;

			const isEventOngoing = event.status === EventStatus.ONGOING;
			const toastId = toast.push(isEventOngoing ? addLoadingIcon(event.message) : event.message, {
				initial: event.dismissAfter > 0 ? 1 : 0,
				duration: event.dismissAfter > 0 ? event.dismissAfter : undefined,
				reversed: true,
				dismissable: !isEventOngoing,
				theme: event !== null ? getColorTheme(event.appearance) : undefined
			});

			// Push ongoing events to the ongoing events queue
			if (isEventOngoing) ongoingEvents.push([toastId, event.id]);
		}

		// Poll the API every second
		setTimeout(async () => {
			// Recursively call the function
			getEvents();
		}, ONE_SECOND_IN_MILLISECONDS);
	};

	onMount(() => {
		getEvents();
	});
</script>

<SvelteToast />

<style lang="scss">
	:global(._toastContainer) {
		--toastContainerTop: none;
		--toastContainerBottom: 64px;
		--toastContainerRight: 20px;

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

	:global(.toastLoadingMsg) {
		display: flex;
		column-gap: 8px;
		flex-direction: row-reverse;
		justify-content: space-between;
	}
	:global(.toastLoadingMsg__icon) {
		width: 16px;
		height: 16px;
	}

	:global(.toastLoadingMsg__p) {
		margin: 0;
	}
</style>
