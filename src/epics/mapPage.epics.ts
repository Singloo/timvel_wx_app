import { ofType } from 'redux-observable';
import { Observable } from 'rxjs';
import { mergeMap, takeLast } from 'rxjs/operators';
import '@tarojs/async-await';
import Taro from '@tarojs/taro';
const baseUrl = 'https://www.timvel.com/wx';
const sendPost = (action$, state$, { logic }) =>
  action$.pipe(
    ofType('MAP_PAGE_CREATE_POST'),
    mergeMap((action: any) =>
      Observable.create(async observer => {
        try {
          const {
            username,
            avatar,
            content,
            city,
            latitude,
            longitude,
            callback,
          } = action.payload;
          Taro.showLoading({ title: 'Sending.....' });
          await Taro.request({
            url: baseUrl + '/post_new',
            data: {
              username,
              avatar,
              content,
              latitude,
              longitude,
              city,
            },
            method: 'POST',
          });
          Taro.hideLoading();
          observer.next(
            logic('MAP_PAGE_SET_STATE', {
              showCreateNew: false,
            }),
          );
          Taro.showToast({
            title: 'Post success!',
            icon: 'success',
          });
          callback &&
            callback({
              username,
              avatar,
              content,
              latitude,
              longitude,
            });
        } catch (error) {
          Taro.hideLoading();
          Taro.showToast({
            title: 'Network error!!!',
            icon: 'none',
          });
          console.warn(error);
        } finally {
          observer.complete();
        }
      }),
    ),
  );

const fetchPosts = (action$, state$, { logic }) =>
  action$.pipe(
    ofType('MAP_PAGE_FETCH_POSTS'),
    mergeMap((action: any) =>
      Observable.create(async observer => {
        try {
          const {} = state$.value.mapPage;
          Taro.showLoading({
            title: 'Fetching data.....',
          });
          const { latitude, longitude, range, offset } = action.payload;
          const { data } = await Taro.request({
            url: baseUrl + '/fetch_posts',
            data: {
              latitude,
              longitude,
              offset: offset || 0,
            },
            method: 'GET',
          });
          console.log(data);
          observer.next(
            logic('MAP_PAGE_SET_STATE', {
              posts: data,
            }),
          );
        } catch (error) {
          console.log(error);
          Taro.hideLoading();
          Taro.showToast({
            title: '请求失败..',
            icon: 'none',
          });
        } finally {
          Taro.hideLoading();
          observer.complete();
        }
      }),
    ),
  );
export default [sendPost, fetchPosts];
