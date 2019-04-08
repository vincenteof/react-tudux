import * as React from 'react'
import { Provider } from '../src/components/Provider'
import { TuduxContext } from '../src/components/Context'
import { createStore, StoreState, Dispatchedable, isPlainAction, IStore } from 'tudux'
import * as rtl from 'react-testing-library'
import 'jest-dom/extend-expect'
import { stat } from 'fs';



describe('provide some store', () => {
  const reducer = (state: StoreState = 'Inited', action: Dispatchedable) => {
    if (isPlainAction(action)) {
      switch (action.type) {
        case 'FIRST':
          return 'First'
        case 'SECOND':
          return {
            value: 'Second'
          }
        default:
          return state
      }
    }
    return state
  }

  const create = (key = 'store') => {
    return class extends React.Component {
      render() {
        return (
          <TuduxContext.Consumer>
            {
              ({ storeState }) => {
                return (
                  <div data-testid="store">{`${key} - ${storeState}`}</div>
                )
              }
            }
          </TuduxContext.Consumer>
        )
      }
    }
  }
  const Child = create()

  afterEach(() => rtl.cleanup())

  it('should not enforce a single child', () => {
    const store = createStore(reducer)

    // tslint:disable-next-line:no-empty
    const spy = jest.spyOn(console, 'error').mockImplementation(() => { })

    expect(() => {
      rtl.render(<Provider store={store} />)
    })

    expect(() => {
      rtl.render(
        <Provider store={store}>
          <div />
        </Provider>
      )
    }).not.toThrow()

    expect(() => {
      rtl.render(
        <Provider store={store}>
          <div />
          <div />
        </Provider>
      )
    }).not.toThrow()

    spy.mockRestore()
  })

  it('should add the store state to context', () => {
    const store = createStore(reducer)

    // tslint:disable-next-line:no-empty
    const spy = jest.spyOn(console, 'error').mockImplementation(() => { })

    const tester = rtl.render(
      <Provider store={store}>
        <Child />
      </Provider>
    )
    expect(spy).toHaveBeenCalledTimes(0)
    spy.mockRestore()

    expect(tester.getByTestId('store')).toHaveTextContent(
      'store - Inited'
    )
  })

  it('accepts new store in props', () => {
    const reducer1 = (state: StoreState = 10, _: Dispatchedable) => {
      if (typeof state === 'number') {
        return state + 1
      }
      return state
    }
    const reducer2 = (state: StoreState = 10, _: Dispatchedable) => {
      if (typeof state === 'number') {
        return state * 2
      }
      return state
    }
    const reducer3 = (state: StoreState = 10, _: Dispatchedable) => {
      if (typeof state === 'number') {
        return state * state + 1
      }
      return state
    }
    const store1 = createStore(reducer1)
    const store2 = createStore(reducer2)
    const store3 = createStore(reducer3)

    // tslint:disable-next-line:no-empty
    let outerSetState = (_: any) => {}
    type Props = {}
    type State = { store: IStore }
    class ProviderContainer extends React.Component<Props, State> {
      constructor(props: Props) {
        super(props)
        this.state = { store: store1 }
        outerSetState = this.setState.bind(this)
      }

      render() {
        return (
          <Provider store={this.state.store}>
            <Child />
          </Provider>
        )
      }
    }

    const tester = rtl.render(<ProviderContainer />)
    expect(tester.getByTestId('store')).toHaveTextContent('store - 11')
    store1.dispatch({ type: 'hi' })
    expect(tester.getByTestId('store')).toHaveTextContent('store - 12')

    outerSetState({ store: store2 })
    expect(tester.getByTestId('store')).toHaveTextContent('store - 20')
    store1.dispatch({ type: 'hi' })
    expect(tester.getByTestId('store')).toHaveTextContent('store - 20')
    store2.dispatch({ type: 'hi' })
    expect(tester.getByTestId('store')).toHaveTextContent('store - 40')

    outerSetState({ store: store3 })
    expect(tester.getByTestId('store')).toHaveTextContent('store - 101')
    store1.dispatch({ type: 'hi' })
    expect(tester.getByTestId('store')).toHaveTextContent('store - 101')
    store2.dispatch({ type: 'hi' })
    expect(tester.getByTestId('store')).toHaveTextContent('store - 101')
    store3.dispatch({ type: 'hi' })
    expect(tester.getByTestId('store')).toHaveTextContent('store - 10202')
  })


})
