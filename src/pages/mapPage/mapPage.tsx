import { ComponentClass } from 'react';
import Taro, { Component, Config, createMapContext } from '@tarojs/taro';
import { View, Button, Text, Map, Image, CoverImage } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import '@tarojs/async-await';
import './mapPage.scss';
import locationIcon from '../assets/location.png';
import createNew from '../assets/new.png';
// import CreateNew from './components/CreateNew';
import PostDetail from './components/PostDetail';
// #region 书写注意
//
// 目前 typescript 版本还无法在装饰器模式下将 Props 注入到 Taro.Component 中的 props 属性
// 需要显示声明 connect 的参数类型并通过 interface 的方式指定 Taro.Component 子类的 props
// 这样才能完成类型检查和 IDE 的自动提示
// 使用函数模式则无此限制
// ref: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20796
//
// #endregion

const randomItem = (arr: Array<any>) => {
  let returnArr:Array<any> = [];
  let i = Math.floor(Math.random() * arr.length);
  let item = arr[i];
  if (typeof item === 'undefined') {
    return returnArr;
  } else {
    returnArr.push(arr[i]);
  }
  return returnArr[0];
};
type IProps = any;

interface Index {
  props: IProps;
}

@connect(
  ({ global, mapPage }) => ({
    global,
    state: mapPage,
  }),
  dispatch => ({
    logic: (type, payload = {}) => {
      dispatch({
        type,
        payload,
      });
    },
  }),
)
class Index extends Component {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '首页',
  };

  componentWillMount() {}

  _initApp = async () => {
    const { isError, username } = this.props.state;
    try {
      if (isError) {
        this.props.logic('MAP_PAGE_SET_STATE', {
          isError: false,
        });
      }
      if (username.length == 0) {
        const userInfo = await Taro.getUserInfo();
        console.log(userInfo);
        this.props.logic('MAP_PAGE_SET_STATE', {
          username: userInfo.userInfo.nickName,
          city: userInfo.userInfo.city,
          avatar: userInfo.userInfo.avatarUrl,
        });
      }
      const location = await Taro.getLocation({ type: 'gcj02' });
      this.props.logic('MAP_PAGE_FETCH_POSTS', {
        latitude: location.latitude,
        longitude: location.longitude,
      });
      this.props.logic('MAP_PAGE_SET_STATE', {
        geoLocation: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });
    } catch (error) {
      Taro.showToast({
        title: '获取地址失败...你拒绝了?',
        icon: 'none',
        duration: 5000,
      });
      this.props.logic('MAP_PAGE_SET_STATE', {
        isError: true,
      });
      console.warn(error);
    }
  };
  componentDidMount() {}
  // componentWillReceiveProps(nextProps) {
  //   console.log(this.props, nextProps);
  // }

  componentWillUnmount() {}

  async componentDidShow() {
    this._initApp();
    // this.mapCtx = Taro.createMapContext('myMap');
  }

  componentDidHide() {}
  onShareAppMessage() {
    const arr = [
      '你在干吗?',
      '啊....',
      '什么?',
      '哇哦',
      'Smile',
      '进来看看?',
      '为什么不?',
    ];
    let title = randomItem(arr);
    return {
      title: title,
      path: 'pages/index/index',
    };
  }
  _onPressMarker = (e: any) => {
    const { markerId } = e;
    this.props.logic('MAP_PAGE_SET_STATE', {
      currentMarkerId: markerId,
      showDetail: true,
    });
  };

  _getCurrenMarkIndex = () => {
    const { currentMarkerId, posts } = this.props.state;
    let currentIndex = -1;
    posts.forEach((item, index) => {
      if (item.postId == currentMarkerId) {
        currentIndex = index;
      }
    });
    return currentIndex;
  };

  _onPressBubble = (e: any) => {
    const { markerId } = e;
    this.props.logic('MAP_PAGE_SET_STATE', {
      currentMarkerId: markerId,
      showDetail: true,
    });
  };

  _onPressCreateNew = () => {
    Taro.navigateTo({
      url: '../createNew/createNew',
    });
  };
  _onPressCloseCreateNew = () => {
    this.props.logic('MAP_PAGE_SET_STATE', {
      showCreateNew: false,
    });
  };

  _onPressClosePostDetail = () => {
    this.props.logic('MAP_PAGE_SET_STATE', {
      showDetail: false,
      currentMarkerId: null,
    });
  };

  _onPressSend = (value: String) => {
    const { username, avatar, city, geoLocation } = this.props.state;
    if (value.length === 0) {
      Taro.showToast({
        title: 'Content can not be empty!!',
        icon: 'none',
      });
      return;
    }

    console.log(value, username);
    if (username.length === 0) {
      Taro.showToast({
        title: '没有你的信息哦...不能发布消息',
        icon: 'none',
      });
      return;
    }
    if (!geoLocation.latitude) {
      Taro.showToast({
        title: '没有你的位置....不能发布消息',
        icon: 'none',
      });
      return;
    }
    this.props.logic('MAP_PAGE_CREATE_POST', {
      username,
      avatar,
      content: value,
      city,
      latitude: geoLocation.latitude,
      longitude: geoLocation.longitude,
    });
  };

  _onPressNext = () => {
    const index = this._getCurrenMarkIndex();
    const { posts } = this.props.state;
    if (index === -1) {
      return;
    }
    if (index === posts.length - 1) {
      Taro.showToast({
        title: '没有更多了...',
        icon: 'none',
      });
      return;
    }
    this.props.logic('MAP_PAGE_SET_STATE', {
      currentMarkerId: posts[index + 1].postId,
    });
  };

  _onPressPrev = () => {
    const index = this._getCurrenMarkIndex();
    const { posts } = this.props.state;
    if (index === -1) {
      return;
    }
    if (index === 0) {
      Taro.showToast({
        title: '没有更多了...',
        icon: 'none',
      });
      return;
    }
    this.props.logic('MAP_PAGE_SET_STATE', {
      currentMarkerId: posts[index - 1].postId,
    });
  };

  _onRegionChange = () => {};
  render() {
    const {
      geoLocation,
      scale,
      showDetail,
      posts,
      currentMarkerId,
      isError,
    } = this.props.state;
    const markers = posts.map(item => {
      return {
        id: item.postId,
        longitude: item.longitude,
        latitude: item.latitude,
        // title: item.content,
        iconPath: locationIcon,
        callout: {
          content: item.content,
          color: '#263238',
          fontSize: 14,
          borderRadius: 4,
          display: 'ALWAYS',
          padding: 4,
        },
        width: 30,
        height: 30,
      };
    });
    const currentMarker = posts.filter(
      item => item.postId == currentMarkerId,
    )[0];
    return (
      <View className="wrapper">
        <View className="full-screen">
          <Map
            // id="myMap"
            className="full-screen"
            latitude={geoLocation.latitude}
            longitude={geoLocation.longitude}
            markers={markers}
            onMarkerTap={this._onPressMarker}
            onCalloutTap={this._onPressBubble}
            scale={scale}
            onRegionChange={this._onRegionChange}
          />
        </View>
        {showDetail && (
          <PostDetail
            onCloseModal={this._onPressClosePostDetail}
            onPressNext={this._onPressNext}
            onPressPrev={this._onPressPrev}
            currentMarker={currentMarker}
          />
        )}
        {isError && (
          <Button className="error-button" onClick={this._initApp}>
            错误,点击重试
          </Button>
        )}
        <CoverImage
          onClick={this._onPressCreateNew}
          className="create-new"
          src={createNew}
        />
      </View>
    );
  }
}

// #region 导出注意
//
// 经过上面的声明后需要将导出的 Taro.Component 子类修改为子类本身的 props 属性
// 这样在使用这个子类时 Ts 才不会提示缺少 JSX 类型参数错误
//
// #endregion

export default Index as ComponentClass<any>;
