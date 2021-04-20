/* eslint-disable no-param-reassign */
import i18next from 'i18next';

const input = document.querySelector('.form-control');
const feedback = document.querySelector('.feedback');
const button = document.querySelector('.btn');
const modal = document.querySelector('#modal');

const renderSuccessText = () => {
  input.classList.remove('is-invalid');
  feedback.textContent = i18next.t('success');
  feedback.classList.remove('text-danger');
  feedback.classList.remove('text-info');
  feedback.classList.add('text-success');
  input.value = '';
  input.focus();
  button.removeAttribute('disabled');
};

const renderLanguage = () => {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = i18next.t(`${el.dataset.i18n}`);
  });
};

const renderSendingData = () => {
  button.setAttribute('disabled', true);
  feedback.classList.remove('text-danger');
  feedback.classList.remove('text-success');
  feedback.classList.add('text-info');
  feedback.textContent = i18next.t('loading');
};

const renderFeeds = (state) => {
  const htmlFeeds = `<h3>${i18next.t('feeds')}</h3><ul>${state.feeds.map((feed) => {
    const title = `<h3>${feed.title}</h3>`;
    const description = `<p>${feed.description}</p>`;
    const titleline = `<li class="list-group-item">${title}${description}</li>`;
    return titleline;
  }).join('')}</ul>`;
  document.querySelector('#feeds').innerHTML = `${htmlFeeds}`;
};

const renderPosts = (state) => {
  const htmlposts = `<ul>${state.posts.map(({
    id, title, link,
  }) => {
    const resultButtons = `<li class="list-group-item d-flex justify-content-between align-itemsstart"><a href="${link}" class="font-weight-bold" target="_blank">${title}</a><button id = "details" data-toggle="modal" data-target="#modal" class="btn btn-primary btn-sm pull-right" data-id=${id}>Подробнее</button></span></li>`;
    return resultButtons;
  }).join('')}</ul>`;
  document.querySelector('.posts').innerHTML = `<h3>${i18next.t('posts')}</h3>${htmlposts}`;

  state.posts.forEach(({
    id, title, link, description,
  }) => {
    const selectedButton = document.querySelector(`[data-id="${id}"]`);
    selectedButton.addEventListener('click', (e) => {
      e.preventDefault();

      document.querySelector('#readLink').setAttribute('href', `${link}`);
      modal.classList.remove('fade');
      modal.style.display = 'block';
      document.querySelector('.modal-title').textContent = `${title}`;
      document.querySelector('.modal-body').textContent = `${description}`;
      const fade = document.createElement('div');
      fade.classList.add('modal-backdrop');
      fade.classList.add('fade');
      fade.classList.add('show');
      document.body.append(fade);
      document.querySelector('#close').addEventListener('click', (e2) => {
        e2.preventDefault();
        modal.classList.add('fade');
        modal.style.display = 'none';
        document.body.removeChild(fade);
      });
      document.querySelector('#close-button').addEventListener('click', (e3) => {
        e3.preventDefault();
        modal.classList.add('fade');
        modal.style.display = 'none';
        document.body.removeChild(fade);
      });
      document.body.addEventListener('keydown', (e4) => {
        if (e4.key === 'Escape') {
          modal.classList.add('fade');
          modal.style.display = 'none';
          document.body.removeChild(fade);
        }
      });
    });
  });
};

const renderError = (state) => {
  input.classList.add('is-invalid', true);
  feedback.classList.add('text-danger');
  if ((state.form.error === 'validations.rss.string')
  || (state.form.error === 'validations.rss.url')
  || (state.form.error === 'validations.rss.required')) {
    feedback.textContent = i18next.t('validationError');
  } else if (state.form.error === 'validations.rss.notOneOf') {
    feedback.textContent = i18next.t('urlAlreadyExistError');
  } else if (state.loadingProcess.error === 'parse xml error') {
    feedback.textContent = i18next.t('parseError');
  } else if (state.loadingProcess.error === 'axiosError') {
    feedback.textContent = i18next.t('netError');
  } else {
    feedback.textContent = i18next.t('unknownError');
  }
  button.removeAttribute('disabled');
};

export {
  renderError, renderSendingData, renderSuccessText,
  renderFeeds, renderPosts, renderLanguage,
};
