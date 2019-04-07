import * as React from 'react'
import { StoreState, IStore } from 'tudux'

type TuduxContextContent = {
  storeState?: StoreState
  store?: IStore
}

const TuduxContext: React.Context<TuduxContextContent> = React.createContext({})

export { TuduxContextContent, TuduxContext }
