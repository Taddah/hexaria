import { inspectState } from "$lib/stores/inspectStore.svelte"
import { getSocket } from "./socket"

export function inspectPlayer(targetId: number) {
    const socket = getSocket()

    inspectState.loading = true
    inspectState.open = true
    inspectState.data = null
    inspectState.error = null
    socket.emit('inspect_request', { targetId })
}

export function registerInspectListener() {
    const socket = getSocket()
    socket.on('inspect_response', (res) => {
        inspectState.loading = false
        if ('error' in res) inspectState.error = res.error
        else inspectState.data = res.data
    })
}

