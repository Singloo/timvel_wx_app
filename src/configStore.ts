import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import { createEpicMiddleware } from 'redux-observable';
import rootReducer from './reducers';
import epics from './epics';

const logic = (type, payload = {}) => {
  return {
    type,
    payload,
  };
};

const deps = { logic };
const epicMiddlewares = createEpicMiddleware({ dependencies: deps });
const middlewares = [epicMiddlewares, createLogger()];

export default function configStore() {
  const store = createStore(rootReducer, applyMiddleware(...middlewares));
  epicMiddlewares.run(epics);
  return store;
}
