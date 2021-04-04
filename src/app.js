import * as yup from 'yup';
import './_custom.scss';
import axios from 'axios';
import _ from 'lodash';
import watchState from './watcher.js';
import parse from './parserRss.js';
import { renderSuccess } from './render.js';

export default () => {
  const schema = yup.object().shape({
    url: yup.string('validations.rss.string').url('validations.rss.url').required('validations.rss.required'),
  });

  const input = document.querySelector('.form-control');
  const form = document.querySelector('.rss-form');

  const watchedState = watchState();

  const validate = (inputUrl) => {
    try {
      schema.validateSync(inputUrl);
      watchedState.form.valid = true;
      return null;
    } catch (e) {
      watchedState.form.valid = false;
      return 'validationError';
    }
  };

  const updateValidationState = (inputedUrl) => {
    const validationError = validate(inputedUrl.form.fields);
    watchedState.form.error = validationError;
  };

  const handleInput = (e) => {
    e.preventDefault();

    watchedState.form.processState = 'filling';
    watchedState.form.fields.url = e.target.value;
    updateValidationState(watchedState);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    watchedState.loadingProcess.status = 'sending';
  };

  input.addEventListener('input', handleInput);
  form.addEventListener('submit', handleSubmit);

  const refreshFeeds = () => {
    const promises = watchedState.feeds.map((feed) => {
      console.log(feed.url);
      return axios.get(`https://hexlet-allorigins.herokuapp.com/raw?url=${feed.url}`)
        .then((response) => {
          const parsedRss = parse(response.data);
          const result = _.differenceWith(parsedRss.items, feed.items, (a, b) => {
            return a.itemTitle === b.itemTitle;
          });
          if (result.length === 0) {
            renderSuccess(watchedState);
          }
        });
    });
    Promise.all(promises)
      .finally(() => {
        setTimeout(refreshFeeds, 5000);
      })
  };
  setTimeout(refreshFeeds, 5000);
};
