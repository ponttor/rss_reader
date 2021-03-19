import * as yup from 'yup';
import i18next from 'i18next';
import onChange from 'on-change';
import axios from 'axios';
import _ from 'lodash';
import parse from './parserRss.js';
import resources from './locales/index.js';
import '../_custom.scss';

export default () => {
  i18next.init({
    lng: 'ru',
    debug: true,
    resources,
  });

  const schema = yup.object().shape({
    url: yup.string('validations.rss.string').url('validations.rss.url').required('validations.rss.required'),
  });

  const inner = document.querySelector('.inner');
  const input = document.querySelector('.form-control');
  const form = document.querySelector('.rss-form');
  const button = document.querySelector('.btn');

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
  };

  let i = 0;
  const list = [];
  const render = ({ feeds }) => {
    if (state.urls.length === 0) {
      return;
    }
    const htmlItemsList = feeds.map((el) => `<ul>${el.items.map(({ itemTitle, itemDescription, itemLink }) => {
      i += 1;
      const resultButtons = `<li class="list-group-item">${itemTitle}<div class="text-right"><button id = "details" data-toggle="modal" data-target="#modal" class ="btn btn-primary pull-right" data-id=${i}>Подробнее</button></div></li>`;
      list.push([itemTitle, itemDescription, itemLink]);

      return resultButtons;
    }).join('')}</ul>`);

    const htmlTitle = `<h3>Feeds</h3><ul>${feeds.map((item) => {
      const firstLine = `<h3>${item.title}</h3>`;
      const secondLine = `<p>${item.description}</p>`;
      const titlelist = `<li class="list-group-item">${firstLine}${secondLine}</li>`;
      return titlelist;
    }).join('')}</ul>`;

    document.querySelector('#feeds').innerHTML = '';
    document.querySelector('.posts').innerHTML = '';
    document.querySelector('#feeds').innerHTML = htmlTitle;
    document.querySelector('.posts').innerHTML = `<h3>Posts</h3>${htmlItemsList}`;
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'loadingProcess.status':

        if ((value === 'sending') && (state.urls.length !== 0) && ((_.difference(state.form.fields.url, state.urls).length === 0))) {
          console.log(state.form.fields.url);
          console.log(state.urls);
          console.log((_.difference(state.form.fields.url, state.urls).length));
          watchedState.form.valid = false;
          watchedState.form.error = 'urlExist';
        }

        if ((value === 'sending') && (state.form.valid)) {
          button.setAttribute('disabled', true);
          console.log(state.form.fields.url);
          axios.get(`https://hexlet-allorigins.herokuapp.com/raw?url=${state.form.fields.url}`)
            .then((response) => {
              const newFeed = parse(response.data);
              watchedState.urls.unshift(state.form.fields.url);
              watchedState.feeds.unshift(newFeed);
              console.log(newFeed);
              watchedState.loadingProcess.status = 'idle';
            })
            .catch((error) => {
              console.log({ error: error.name });
              watchedState.loadingProcess.error = error.message;
              console.log(error.message, error.isAxiosError);
              watchedState.loadingProcess.status = 'failed';
            })
            .finally(() => {
              render(state);
            });
        }

        if ((value === 'sending') && (!state.form.valid)) {
          input.classList.add('is-invalid', true);
          watchedState.loadingProcess.status = 'failed';

          if (state.form.error === 'urlExist') {
            const textContent = i18next.t('urlAlreadyExistError');
            if (!(document.querySelector('.feedback'))) {
              const el = document.createElement('div');
              el.classList.add('feedback');
              el.textContent = textContent;
              inner.append(el);
            } else {
              (document.querySelector('.feedback')).textContent = textContent;
            }
          }
          if (state.form.error === 'validationError') {
            const textContent = i18next.t('validationError');

            if (!(document.querySelector('.feedback'))) {
              const el = document.createElement('div');
              el.classList.add('feedback');
              el.textContent = textContent;
              inner.append(el);
            } else {
              (document.querySelector('.feedback')).textContent = textContent;
            }
          }
        }
        if (value === 'failed') {
          console.log(watchedState.loadingProcess.error);
          button.removeAttribute('disabled');
        }

        if (value === 'idle') {
          watchedState.form.fields.url = '';
          input.value = '';
          button.removeAttribute('disabled');
          watchedState.form.valid = false;
          input.focus();
        }

        break;

      case 'form.valid':
        if (value) {
          input.classList.remove('is-invalid');
          if (document.querySelector('.feedback')) {
            (document.querySelector('.feedback')).textContent = '';
          }
        }
        break;

      case 'loadingProcess.error':

        if (!(document.querySelector('.feedback'))) {
          const el = document.createElement('div');
          el.classList.add('feedback');
          el.textContent = i18next.t('NetError');
          inner.append(el);
        } else {
          (document.querySelector('.feedback')).textContent = i18next.t('netError');
        }
        break;

      default:
        break;
    }
  });

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

  const getFeedsDifference = () => {
    const feedsLength = state.feeds.length;
    for (let z = 0; z <= feedsLength - 1; z += 1) {
      axios.get(`https://hexlet-allorigins.herokuapp.com/raw?url=${state.urls[z]}`)
        .then((response) => {
          const parsedRss = parse(response.data);
          if (state.feeds.includes(parsedRss)) {
            return;
          }
          state.feeds[z] = parsedRss;
          console.log('changed rss');
        });

      render(state);
      setTimeout(getFeedsDifference, 5000);
    }
  };
  setTimeout(getFeedsDifference, 5000);
};
