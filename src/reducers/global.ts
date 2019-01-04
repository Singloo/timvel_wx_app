const INITIAL_STATE = {};

export default function counter(state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'GLOBAL_SET_STATE':
      return {
        ...state,
        ...action.payload,
      };
    case 'GLOBAL_RESET_STATE':
      return INITIAL_STATE;
    default:
      return state;
  }
}
