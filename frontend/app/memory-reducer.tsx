import React from 'react'

interface memoryCheck {
  core_memory_files: string[],
  recall_memory_files: string[]
}


export const initialState: memoryCheck = {
  core_memory_files: [],
  recall_memory_files: []
}

export const memoryContext = React.createContext<any>([initialState, () => {}])

export const memoryReducer = (state = initialState, { payload }: { payload: memoryCheck}) => {
  state.core_memory_files = payload?.core_memory_files?.length !== 0 ? [...payload?.core_memory_files] : []
  state.recall_memory_files = payload?.recall_memory_files?.length !== 0 ? [...payload?.recall_memory_files] : []
  return {...state}
}