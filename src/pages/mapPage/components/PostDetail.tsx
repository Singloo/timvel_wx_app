import { ComponentClass } from 'react';
import Taro, { Component, Config } from '@tarojs/taro';
import {
  View,
  Button,
  Text,
  Image,
  CoverView,
  CoverImage,
} from '@tarojs/components';
import { connect } from '@tarojs/redux';
import close from '../../assets/wrong.png';
import './components.scss';

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

// @connect(
//   ({ global }) => ({
//     global,
//   }),
//   dispatch => ({
//     logic: (type, payload = {}) => {
//       dispatch({
//         type,
//         payload,
//       });
//     },
//   }),
// )

class Index extends Component {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  // config: Config = {
  //   navigationBarTitleText: '首页',
  // };

  componentWillReceiveProps(nextProps) {
    console.log(this.props, nextProps);
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  render() {
    const {
      onCloseModal,
      currentMarker,
      onPressPrev,
      onPressNext,
    } = this.props;
    console.log('aaaa', currentMarker);
    let createdAt = new Date(currentMarker.createdAt);
    let dateString =
      createdAt.getMonth() +
      1 +
      '月' +
      createdAt.getDate() +
      '日 ' +
      createdAt.getHours() +
      ':' +
      createdAt.getMinutes();
    return (
      <CoverView className="post-container full-screen">
        <CoverView className="content-container">
          <CoverView
            className="user-info-container"
            style="justify-content:space-between"
          >
            <CoverView className="user-info-container">
              <CoverImage className="avatar" src={currentMarker.avatar} />
              <CoverView className="username">
                {currentMarker.username}
              </CoverView>
            </CoverView>

            <CoverView
              className="username"
              style="font-size:12px;text-align:right;margin-right:10px;width:150px"
            >
              {dateString}
            </CoverView>
          </CoverView>
          <CoverView className="content">{currentMarker.content}</CoverView>
          <CoverView
            className="user-info-container"
            style="justify-content:space-between;margin-top:20px"
          >
            <Button className="control-button" onClick={onPressPrev}>
              Prev
            </Button>
            <Button className="control-button" onClick={onPressNext}>
              Next
            </Button>
          </CoverView>
        </CoverView>
        <CoverView className="create-new-blank-view" onClick={onCloseModal} />
      </CoverView>
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
