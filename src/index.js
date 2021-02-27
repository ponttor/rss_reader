// import '../styles/main.css';
import * as yup from 'yup';
import i18next from 'i18next';
// import _ from 'lodash';
import onChange from 'on-change';
import axios from 'axios';
import parse from './parserRss.js';
import resources from './locales/index.js';
import '../_custom.scss';

i18next.init({
  lng: 'ru',
  debug: true,
  resources,
});

const schema = yup.object().shape({
  url: yup.string('validations.rss.string').url('validations.rss.url').required('validations.rss.required'),
});

const result = document.querySelector('.result');
const inner = document.querySelector('.inner');
const input = document.querySelector('.form-control');
const form = document.querySelector('.form-inline');
const button = document.querySelector('.btn');

// export default () => {
const state = {
  loadingProcess: {
    status: '', // idle (input ''), sending (blocked, loader), failed (error)
    error: null,
  },
  feeds: [],
  form: {
    processState: 'filling',
    fields: {
      url: '',
    },
    valid: null,
    error: null,
  },
};

const render = ({ feeds }) => {
  result.innerHTML = '';
  const htmlTitle = `<ul>${feeds.map((item) => `<h3>${item.title}</h3>`).join('')}</ul>`;
  const htmlDescription = `<ul>${feeds.map((item) => `<h5>${item.description}</h5>`).join('')}</ul>`;
  const htmlItemsList = feeds.map((el) => `<ul>${el.items.map((item) => `<li>${item.itemTitle} - ${item.itemLink}</li>`).join('')}</ul>`);
  result.innerHTML = htmlTitle + htmlDescription + htmlItemsList;
};

const watchedState = onChange(state, (path, value) => {
  switch (path) {
    case 'loadingProcess.status':
      if ((value === 'sending') && (state.form.valid)) {
        button.setAttribute('disabled', true);

        axios.get(state.form.fields.url)
          .then((response) => {
            const newFeed = parse(response.data);
            watchedState.feeds.unshift(newFeed);
            watchedState.loadingProcess.status = 'idle';
          })
          .catch((error) => {
            watchedState.loadingProcess.error = error.message; // Net error vs no Rss error
            watchedState.loadingProcess.status = 'failed';
          })
          .finally(() => {
            render(state);
          });
      }

      if ((value === 'sending') && (!state.form.valid)) {
        input.classList.add('is-invalid', true);
        watchedState.loadingProcess.status = 'failed';

        if (!(document.querySelector('.feedback'))) {
          const el = document.createElement('div');
          el.classList.add('feedback');
          el.textContent = i18next.t('validationError');
          inner.append(el);
        } else {
          (document.querySelector('.feedback')).textContent = i18next.t('validationError');
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
        (document.querySelector('.feedback')).textContent = i18next.t('NetError');
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
    return e.message;
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
