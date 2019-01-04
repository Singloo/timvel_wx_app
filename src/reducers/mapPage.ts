const INITIAL_STATE = {
  geoLocation: {},
  currentMarkerId: null,
  scale: 16,
  showDetail: false,
  posts: [],
  username: '',
  city: '',
  avatar: '',
  isError: false,
};

export default function counter(state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'MAP_PAGE_SET_STATE':
      return {
        ...state,
        ...action.payload,
      };
    case 'MAP_PAGE_RESET_STATE':
      return INITIAL_STATE;
    default:
      return state;
  }
}
