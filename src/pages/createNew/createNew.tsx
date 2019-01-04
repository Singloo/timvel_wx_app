import { ComponentClass } from 'react';
import Taro, { Component, Config } from '@tarojs/taro';
import { View, Button, Image, Text, Textarea } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import '@tarojs/async-await';
import './createNew.scss'

// #region 书写注意
//
// 目前 typescript 版本还无法在装饰器模式下将 Props 注入到 Taro.Component 中的 props 属性
// 需要显示声明 connect 的参数类型并通过 interface 的方式指定 Taro.Component 子类的 props
// 这样才能完成类型检查和 IDE 的自动提示
// 使用函数模式则无此限制
// ref: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20796
//
// #endregion

type IProps = any;
interface CreateNew {
  props: IProps;
  state: any;
}

@connect(
  ({ global, mapPage }) => ({
    global,
    mapPage,
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
class CreateNew extends Component {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '说点什么..',
  };
  constructor() {
    super(...arguments);
    this.state = {
      value: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    console.log(this.props, nextProps);
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  _onChangeText = e => {
    const { value } = e.detail;
    this.setState({
      value,
    });
  };

  _onPressSend = () => {
    const { username, avatar, city, geoLocation } = this.props.mapPage;
    const { value } = this.state;
    let _value = value.trim();
    if (_value.length === 0) {
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
      content: _value,
      city,
      latitude: geoLocation.latitude,
      longitude: geoLocation.longitude,
      callback: this._onPostSuccess,
    });
  };

  _onPostSuccess = (post: Object) => {
    Taro.navigateBack();
    const { posts } = this.props.mapPage;
    this.props.logic('MAP_PAGE_SET_STATE', {
      posts: posts.concat([post]),
    });
  };
  render() {
    const { value } = this.state;
    return (
      <View className="create-new-container full-screen">
        <View className="content-container column-container">
          <Textarea
            className="text-input"
            placeholder={'say something...'}
            value={value}
            onInput={this._onChangeText}
          />
          <Button onClick={this._onPressSend}>Send</Button>
        </View>
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

export default CreateNew as ComponentClass<any>;
