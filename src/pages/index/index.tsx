import { ComponentClass } from 'react';
import Taro, { Component, Config } from '@tarojs/taro';
import { View, Button, Image, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import MapPage from '../mapPage/mapPage';
import '@tarojs/async-await';
import logo from '../assets/logo.png';
import './index.scss';

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
interface Index {
  props: IProps;
}

@connect(
  ({ global }) => ({
    global,
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

  componentWillReceiveProps(nextProps) {
    console.log(this.props, nextProps);
  }

  componentWillUnmount() {}

  async componentDidShow() {
    this._onPressStart();
  }

  componentDidHide() {}

  _onPressStart = async () => {
    try {
      const success = await Taro.login({});
      if (success) {
        const userInfo = await Taro.getUserInfo();
        this.props.logic('MAP_PAGE_SET_STATE', {
          username: userInfo.userInfo.nickName,
          city: userInfo.userInfo.city,
          avatar: userInfo.userInfo.avatarUrl,
        });
        Taro.redirectTo({
          url: '../mapPage/mapPage',
        });
      }
    } catch (error) {
      console.warn(error);
    }
  };
  _showAlert = async () => {
    try {
      const res = await Taro.showModal({
        title: '',
        content: '需要你的授权才可以继续使用',
      });
      if (res.confirm) {
        const suc = await Taro.openSetting({});
        if (suc) {
          this._onPressStart();
        }
      } else {
        Taro.showToast({
          title: '那没办法了',
          icon: 'none',
        });
      }
    } catch (error) {}
  };
  render() {
    return (
      <View className="container">
        <Image className="logo" src={logo} />
        <Text style="text-align:center;margin-top:100px;margin-bottom:100px">
          {'你好人类\n让我们开始吧'}
        </Text>
        <Button openType="getUserInfo" onClick={this._onPressStart}>
          点击这里
        </Button>
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
