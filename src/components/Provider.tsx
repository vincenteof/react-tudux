import * as React from 'react'
import { IStore, StoreState, StoreUnsubscribe } from 'tudux'
import { TuduxContext } from './Context'

type ProviderProps = {
  store: IStore
}

type ProviderState = {
  storeState: StoreState,
  store: IStore
}

class Provider extends React.Component<ProviderProps, ProviderState> {
  private unsubscribe?: StoreUnsubscribe
  private mounted: boolean 

  constructor(props: ProviderProps) {
    super(props)
    this.mounted = false
    const { store } = this.props
    this.state = {
      storeState: store.getState(),
      store
    }
  }

  componentDidMount() {
    this.mounted = true
    const { store } = this.props
    this.unsubscribe = store.subscribe(() => {
      if (this.mounted) {
        this.setState({
          storeState: store.getState()
        })
      }
    })
  }

  componentWillUnmount() {
    this.mounted = false
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  }

  render() {
    const { children } = this.props
    return (
      <TuduxContext.Provider value={this.state}>
        {children}
      </TuduxContext.Provider>
    )
  }
}

export { Provider }