import onChange from 'on-change';
import _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import resources from './locales/index.js';
import parse from './parserRss.js';

import {
  renderSuccess, renderError, renderClick,
} from './render.js';

const watchState = () => {
  i18next.init({
    lng: 'ru',
    debug: true,
    resources,
  });

  const state = {
    loadingProcess: {
      status: '',
      error: null,
    },
    feeds: [],
    urls: [],
    form: {
      processState: 'filling',
      fields: {
        url: '',
      },
      valid: null,
      error: null,
    },
    ui: {
      post: null,
    },
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'loadingProcess.status':
        if ((value === 'sending') && (state.urls.length !== 0) && (state.urls.includes(state.form.fields.url))) {
          renderClick();
          state.loadingProcess.status = 'idle';
          watchedState.form.error = 'urlExist';
          renderError(state);
          watchedState.form.error = null;
        } else if ((value === 'sending') && (state.form.valid)) {
          renderClick();
          axios.get(`https://hexlet-allorigins.herokuapp.com/raw?url=${state.form.fields.url}`)
            .then((response) => {
              const newFeed = parse(response.data);
              watchedState.urls.unshift(state.form.fields.url);
              newFeed.url = state.form.fields.url;
              watchedState.feeds.unshift(newFeed);
              watchedState.loadingProcess.status = 'idle';
              renderSuccess(state);
            })
            .catch((error) => {
              watchedState.form.valid = false;
              watchedState.loadingProcess.status = 'failed';
              if (error.message === 'parse xml error') {
                watchedState.loadingProcess.error = 'parseError';
                renderError(state);
              } else if (error.isAxiosError === true) {
                watchedState.loadingProcess.error = 'axiosError';
                renderError(state);
              } else {
                watchedState.loadingProcess.error = 'unknownError';
                renderError(state);
                console.log(`ошибка - ${error.message}`);
              }
              state.loadingProcess.error = null;
              watchedState.form.valid = true;
            });
        } else if ((value === 'sending') && (!state.form.valid)) {
          renderClick();
          state.loadingProcess.status = 'failed';
          watchedState.form.error = 'validationError';
          renderError(state);
          watchedState.form.error = null;
        }

        break;

      default:
        break;
    }
  });
  return watchedState;
};
export default watchState;
