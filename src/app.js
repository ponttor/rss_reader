import * as yup from 'yup';
import './_custom.scss';
import axios from 'axios';
import _ from 'lodash';
import i18next from 'i18next';
import parse from './parserRss.js';
import { renderLanguage, watchState } from './render.js';
import resources from './locales/index.js';

export default () => {
  const schema = yup.string('NotString').url('notUrl').required('notRequired');
  const input = document.querySelector('.form-control');
  const form = document.querySelector('.rss-form');

  i18next.init({
    lng: 'ru',
    debug: true,
    resources,
  });

  const state = {
    loadingProcess: {
      status: 'idle',
      error: null,
    },
    feeds: [],
    posts: [],
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

  const watchedState = watchState(state);

  const validate = (url) => {
    const urls = watchedState.feeds.map((feed) => feed.url);
    const newSchema = schema.notOneOf(urls, 'theSame');
    try {
      newSchema.validateSync(url);
      watchedState.form.valid = true;
      watchedState.form.error = null;
    } catch (e) {
      watchedState.form.valid = false;
      watchedState.form.error = e.message;
    }
  };

  const getUrlWithProxy = (url) => `https://hexlet-allorigins.herokuapp.com/raw?url=${url}&disableCache=true`;

  const handleInput = (e) => {
    e.preventDefault();
    watchedState.form.processState = 'filling';
    watchedState.form.fields.url = e.target.value;
    validate(watchedState.form.fields.url);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    watchedState.loadingProcess.status = 'sending';
    if (watchedState.form.valid === false) {
      watchedState.loadingProcess.status = 'formError';
      return;
    }
    const url = getUrlWithProxy(state.form.fields.url);
    axios.get(url)
      .then((response) => {
        const data = parse(response.data);
        const feed = {
          description: data.description,
          url: state.form.fields.url,
          title: data.title,
          id: _.uniqueId(),
        };
        const posts = data.items.map((item) => ({ id: _.uniqueId(), ...item, feedId: feed.id }));
        watchedState.feeds.unshift(feed);
        watchedState.posts.unshift(...posts);
        watchedState.loadingProcess.status = 'success';
        watchedState.form.error = null;
      })
      .catch((error) => {
        state.loadingProcess.error = error.message;
        watchedState.loadingProcess.status = 'loadingError';
        watchedState.form.error = null;
      });
  };

  document.addEventListener('DOMContentLoaded', () => {
    renderLanguage();
    input.addEventListener('input', handleInput);
    form.addEventListener('submit', handleSubmit);
  });

  const refreshFeeds = () => {
    const promises = watchedState.feeds.map((feed) => axios.get(getUrlWithProxy(feed.url))
      .then((response) => {
        const parsedRss = parse(response.data);
        const result = _.differenceWith(parsedRss.items,
          watchedState.posts, (a, b) => a.title === b.title);
        const posts = result.map((item) => ({ id: _.uniqueId(), ...item, feedId: feed.id }));
        watchedState.posts.unshift(...posts);
      }).catch(_.noop));
    Promise.all(promises)
      .finally(() => {
        setTimeout(refreshFeeds, 5000);
      });
  };
  setTimeout(refreshFeeds, 5000);
};
