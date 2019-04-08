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
    this.subscribeToStore()
  }

  componentWillUnmount() {
    this.mounted = false
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  }

  // actually derived state is an anti-pattern, and we can just merge props and state and pass it to context
  // but we need to make new subscription if a new store is passed, which is side-effect, so we can use it here  
  componentDidUpdate(prevProps: ProviderProps) {
    if (this.props.store !== prevProps.store) {
      if (this.unsubscribe) {
        this.unsubscribe()
      }
      this.subscribeToStore()
    }
    }

  subscribeToStore() {
    const { store } = this.props
    this.unsubscribe = store.subscribe(() => {
      if (this.mounted) {
        this.setState({
          storeState: store.getState()
        })
      }
    })
    // a new store may bring a new store state,
    // and it should reflect to context if happens
    const currentStoreState = store.getState()
    if (currentStoreState !== this.state.storeState) {
      this.setState({
        storeState: currentStoreState
      })
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