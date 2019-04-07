import * as React from 'react'
import { DispatchFunc, WrappedDispatch, ActionCreator, bindActionCreators } from 'tudux'
import { TuduxContext } from '../components/Context'


// todo: add type constraint
type MapStateToProps = (state: any, ownProps?: any) => any

type MapDispatchToPropsFunc = (dispatch: DispatchFunc) => { [prop: string]: WrappedDispatch }
type MapDispatchToPropsObject = { [prop: string]: ActionCreator }
type MapDispatchToProps = MapDispatchToPropsFunc | MapDispatchToPropsObject

function isMapDispatchToPropsFunc(mapThing: MapDispatchToProps): mapThing is MapDispatchToPropsFunc {
  return mapThing instanceof Function
}

function connect<P extends {}>(mapStateToProps: MapStateToProps, mapDispatchToProps: MapDispatchToProps) {
  return function(WrappedComponent: React.ComponentType<P>) {
    return class extends React.Component {
      render() {
        return (
          <TuduxContext.Consumer>
            {
              value => {
                const topState = value.storeState
                const topStore = value.store
                const dispatch = topStore
                  ? topStore.dispatch.bind(topStore)
                  : () => { throw new Error('Top store is empty.') } 

                const innerProps = mapStateToProps(topState, this.props)
                let innerDispatch
                if (isMapDispatchToPropsFunc(mapDispatchToProps)) {
                  innerDispatch = mapDispatchToProps(dispatch)
                } else {
                  innerDispatch = bindActionCreators(mapDispatchToProps, dispatch)
                }
                
                return (
                  <WrappedComponent
                    {...innerProps}
                    {...innerDispatch}
                  />
                )
              }
            }
          </TuduxContext.Consumer>
        )
      }
    }
  }
}

export {
  MapStateToProps,
  MapDispatchToProps,
  MapDispatchToPropsFunc,
  MapDispatchToPropsObject,
  connect
}