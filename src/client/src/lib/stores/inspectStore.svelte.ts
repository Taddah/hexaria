import type { InspectData } from "$shared"

interface InspectState {
    open: boolean
    data: InspectData | null
    error: string | null
    loading: boolean
}

export const inspectState = $state<InspectState>({
    open: false,
    data: null,
    error: null,
    loading: false
})
