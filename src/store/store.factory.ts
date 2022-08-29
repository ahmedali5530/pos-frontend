import { applyMiddleware, createStore, Store } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';
import { rootReducer } from '../duck/_root/root.reducer';
import { rootSaga } from '../duck/_root/root.saga';
import { entityMiddleware } from '../duck/entity/entity.middleware';


export class StoreFactory {

  static createStore(): Store {
    const composeEnhancers = StoreFactory.createComposeEnhancers();
    const sagaMiddleware = createSagaMiddleware();

    const store = createStore(
      rootReducer,
      composeEnhancers(
        applyMiddleware(
          entityMiddleware,
          sagaMiddleware
        )
      )
    );

    sagaMiddleware.run(rootSaga);

    return store;
  }

  private static createComposeEnhancers() {
    return composeWithDevTools;
  }
}
