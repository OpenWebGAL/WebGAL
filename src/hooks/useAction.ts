import { useEffect, useRef } from 'react'

type ActionCallback = () => (void | (() => void | undefined))
type DependencyList = ReadonlyArray<unknown>

export const useAction = (action: ActionCallback, deps: DependencyList) => {
    const { current: data } = useRef<{
        deps: DependencyList | undefined,
        cleanUp: ReturnType<ActionCallback> | undefined,
    }>({
        deps: undefined,
        cleanUp: undefined,
    })

    const execute = shouldExecute(data.deps, deps)
    if (execute) {
        if (data.cleanUp) data.cleanUp()
        data.deps = deps
        data.cleanUp = action()
    }

    useEffect(() => () => {
        if (data.cleanUp) data.cleanUp()
    }, [])
}

const shouldExecute = (oldDeps: DependencyList | undefined, deps: DependencyList): boolean => {
    if (oldDeps === undefined || deps === undefined) return true

    if (oldDeps.length !== deps.length) return true

    const length = oldDeps.length
    for (let i = 0; i < length; i++) {
        if (deps[i] !== oldDeps[i]) return true
    }
    return false
}