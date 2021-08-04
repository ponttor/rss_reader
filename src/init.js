import * as yup from 'yup';
import 'bootstrap';
import './_custom.scss';
import axios from 'axios';
import _ from 'lodash';
import i18next from 'i18next';
import parse from './parserRss.js';
import { renderLanguage, watchState } from './render.js';
import resources from './locales/index.js';

export default () => {
  const elements = {
    input: document.querySelector('.form-control'),
    form: document.querySelector('.rss-form'),
    feedback: document.querySelector('.feedback'),
    button: document.querySelector('[name="add"]'),
    modal: document.querySelector('#modal'),
    feeds: document.querySelector('#feeds'),
    posts: document.querySelector('.posts'),
    readLink: document.querySelector('#readLink'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalClose: document.querySelector('#close'),
    closeButton: document.querySelector('#close-button'),
  };

  const schema = yup.string('NotString').url('notUrl').required('notRequired');

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
      postId: null,
      seenPosts: new Set(),
    },
  };

  const watchedState = watchState(state, elements);
  const getUrlWithProxy = (url) => {
    const newUrl = new URL('/get', 'https://hexlet-allorigins.herokuapp.com');
    newUrl.searchParams.set('disableCache', 'true');

    newUrl.searchParams.set('url', url);
    return newUrl.toString();
  };

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

  const handleInput = (e) => {
    e.preventDefault();
    watchedState.form.processState = 'filling';
    watchedState.form.fields.url = e.target.value;
    validate(watchedState.form.fields.url);
  };

  const getErrorType = (error) => {
    if (error.isAxiosError) {
      return 'networkError';
    } if (error.isParsingError) {
      return 'parsingError';
    }
    return 'unknownError';
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
        const data = parse(response.data.contents);
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
        state.loadingProcess.error = getErrorType(error);
        watchedState.loadingProcess.status = 'loadingError';
        watchedState.form.error = null;
      });
  };

  renderLanguage();
  elements.input.addEventListener('input', handleInput);
  elements.form.addEventListener('submit', handleSubmit);
  const refreshTime = 5000;

  const refreshFeeds = () => {
    const promises = watchedState.feeds.map((feed) => axios.get(getUrlWithProxy(feed.url))
      .then((response) => {
        const parsedRss = parse(response.data.contents);
        const result = _.differenceWith(parsedRss.items,
          watchedState.posts, (a, b) => a.title === b.title);
        const posts = result.map((item) => ({ id: _.uniqueId(), ...item, feedId: feed.id }));
        watchedState.posts.unshift(...posts);
      }).catch(_.noop));
    Promise.all(promises)
      .finally(() => {
        setTimeout(refreshFeeds, refreshTime);
      });
  };
  setTimeout(refreshFeeds, refreshTime);
  elements.posts.addEventListener('click', (e) => {
    if (!('id' in e.target.dataset)) {
      return;
    }
    watchedState.ui.postId = e.target.dataset.id;
    watchedState.ui.seenPosts.add(e.target.dataset.id);
  });
};
