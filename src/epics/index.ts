import { combineEpics } from 'redux-observable';
import mapPage from './mapPage.epics';
const epics = [].concat(mapPage);
export default combineEpics(...epics);
