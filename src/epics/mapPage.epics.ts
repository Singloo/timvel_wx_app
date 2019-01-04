import { ofType } from 'redux-observable';
import { Observable, from, of } from 'rxjs';
import {
  mergeMap,
  switchMap,
  map,
  retryWhen,
  concatMap,
  retry,
  catchError,
} from 'rxjs/operators';
import '@tarojs/async-await';
import Taro from '@tarojs/taro';
const baseUrl = 'https://timvel.com/wx';
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
    switchMap(({ payload }) => {
      const { latitude, longitude, range, offset } = payload;
      return from(
        Taro.request({
          url: baseUrl + '/fetch_posts',
          data: {
            latitude,
            longitude,
            offset: offset || 0,
          },
          method: 'GET',
        }),
      ).pipe(
        map(({ data }) => {
          Taro.hideLoading();
          return logic('MAP_PAGE_SET_STATE', {
            posts: data,
          });
        }),
        retry(3),
        catchError(() => {
          Taro.hideLoading();
          Taro.showToast({
            title: '请求失败..',
            icon: 'none',
          });
          return of(logic(null));
        }),
      );
    }),
    // mergeMap((action: any) =>
    //   Observable.create(async observer => {
    //     try {
    //       Taro.showLoading({
    //         title: 'Fetching data.....',
    //       });
    //       const { latitude, longitude, range, offset } = action.payload;
    //       const { data } = await Taro.request({
    //         url: baseUrl + '/fetch_posts',
    //         data: {
    //           latitude,
    //           longitude,
    //           offset: offset || 0,
    //         },
    //         method: 'GET',
    //       });
    //       console.log(data);
    //       observer.next(
    //         logic('MAP_PAGE_SET_STATE', {
    //           posts: data,
    //         }),
    //       );
    //     } catch (error) {
    //       console.log(error);
    //       Taro.hideLoading();
    //       Taro.showToast({
    //         title: '请求失败..',
    //         icon: 'none',
    //       });
    //     } finally {
    //       Taro.hideLoading();
    //       observer.complete();
    //     }
    //   }),
    // ),
  );
export default [sendPost, fetchPosts];
