// import '../styles/main.css';
import * as yup from 'yup';
import i18next from 'i18next';
// import _ from 'lodash';
import onChange from 'on-change';
import axios from 'axios';
import parse from './parserRss.js';
import resources from './locales/index.js';
import '../_custom.scss';
// import { render } from 'node-sass';

// import request from './request.js';

// const { addDevServerEntrypoints } = require("webpack-dev-server");

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
    // processError: null,
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

// form, loadingProcess, feed
const watchedState = onChange(state, (path, value) => {
  // alert('value changed!');
  switch (path) {
    case 'loadingProcess.status':
      if ((value === 'sending') && (state.form.valid)) { // показать лоадер
        button.setAttribute('disabled', true);

        axios.get(state.form.fields.url)
          .then((response) => {
            const newFeed = parse(response.data);
            console.log(newFeed);
            watchedState.feeds.unshift(newFeed);
            console.log(state.feeds);
            watchedState.loadingProcess.status = 'idle';
            // const { title, description, items } = parse(response.data);
            // const newRss = { title, description, posts };
            // state.rss.push(newRss);
            // console.log(`title: ${newFeed.title}, description: ${newFeed.description}`);
            // console.log(`items: ${newFeed.items}`);
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
          alert('error');
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
        alert('error');
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
  // if (state.form.valid) {
  //   input.classList.remove('is-invalid');
  // }
};

const handleSubmit = (e) => {
  e.preventDefault();
  watchedState.loadingProcess.status = 'sending';
  // console.log(state.form.valid);
  // if (watchedState.form.valid === false) {
  //   // input.classList.add('is-invalid', true);
  //   return;
  // }

  // watchedState.form.processState = 'sending';

  // try {
  //   await axios.post(routes.usersPath(), watchedState.form.fields);
  //   watchedState.form.processState = 'finished';
  // } catch (err) {
  //   // В реальных приложениях также требуется корректно обрабатывать сетевые ошибки
  //   watchedState.form.processError = errorMessages.network.error;
  //   watchedState.form.processState = 'failed';
  //   // здесь это опущено в целях упрощения приложения
  //   throw err;
  // }
};

input.addEventListener('input', handleInput);
form.addEventListener('submit', handleSubmit);

// const watchedState = onChange(state, (path, value) => {
//   if (path === 'state.form.processState') {
//     if (value === 'sending') {
//       button.setAttribute('disabled');
//       input.value = '';
//     }
//   }
// });

// input.addEventListener('change', (e) => {
//   watchedState.registrationForm.data.name = e.target.value;
//   // Действия: валидация, запросы, ...
// });

// form.elements.email.addEventListener('change', (e) => {
//   watchedState.registrationForm.data.email = e.target.value;
//   // Действия: валидация, запросы, ...
// });

// button.addEventListener('onclick', handleClick);

// };
// const handleSubmit = (e) => {
//   e.preventDefault();
//   schema
//     .isValid({
//       input: state.input,
//     })
//     .then((content) => {
//       if ((!content) || (_.includes(state.content, state.input))) {
//         // alert(`${state.content}, ${content}, ${state.input}`);
//         // input.reset();
//         input.classList.add('is-invalid');
//       } else {
//         state.content.unshift(state.input);
//         const result = state.content.join('\n');
//         alert(result);
//         form.reset();
//         // return false;
//       }
//     });
// };

// const handleClick = (e) => {
//   e.preventDefault();
// };
// const isValid = await schema.isValid(inputContent);
// alert(isValid);

//   alert(validation(state.input));
// if (validation(state)) {
//   alert('valid');
//   state.content.unshift(state.input);
//   console.log(state.content);

// input.removeClass('action');
// input.classList.add('is-invalid');
// alert('ok');
// };
