import type { ComponentProps } from 'svelte';

import type { DialogComponentBase, Dialog, DialogOut } from './internal/dialog.js';

import { DialogStack } from './internal/dialog-stack.js';

import DialogArea from './internal/comps/DialogArea.svelte';
import DialogConnector from './internal/comps/DialogConnector.svelte';
import DialogDisplay from './internal/comps/DialogDisplay.svelte';
import DialogSection from './internal/comps/DialogSection.svelte';

// @ts-ignore because `npm run check-ts` gives the error 'error TS2315: Type 'SvelteComponentDev' is not generic',
//  maybe because of how Svelte generic component typing works...
export type DialogConnectorOf<Comp extends DialogComponentBase> = DialogConnector<
	Comp,
	keyof ComponentProps<Comp>
>;

export { Dialog, DialogOut, DialogStack, DialogArea, DialogConnector, DialogDisplay, DialogSection };
