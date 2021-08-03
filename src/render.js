/* eslint-disable no-param-reassign */
import i18next from 'i18next';
import onChange from 'on-change';

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

const renderLanguage = () => {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = i18next.t(`${el.dataset.i18n}`);
  });
};

const watchState = (state) => {
  const renderSuccessText = () => {
    elements.input.classList.remove('is-invalid');
    elements.feedback.textContent = i18next.t('success');
    elements.feedback.classList.remove('text-danger');
    elements.feedback.classList.remove('text-info');
    elements.feedback.classList.add('text-success');
    elements.input.value = '';
    elements.input.focus();
    elements.button.removeAttribute('disabled');
    elements.input.removeAttribute('readonly');
  };

  const renderSendingData = () => {
    elements.input.setAttribute('readonly', true);
    elements.button.setAttribute('disabled', true);
    elements.feedback.classList.remove('text-danger');
    elements.feedback.classList.remove('text-success');
    elements.feedback.classList.add('text-info');
    elements.feedback.textContent = i18next.t('loading');
  };

  const renderFeeds = (stateValue) => {
    const feedsContent = stateValue.feeds.map((feed) => {
      const title = `<h3>${feed.title}</h3>`;
      const description = `<p>${feed.description}</p>`;
      const titleline = `<li class="list-group-item">${title}${description}</li>`;
      return titleline;
    }).join('');
    const htmlFeeds = `<h3>${i18next.t('feeds')}</h3><ul>${feedsContent}</ul>`;
    elements.feeds.innerHTML = `${htmlFeeds}`;
  };

  const getPostsHtml = ({ posts, ui: { seenPosts } }) => {
    const listPosts = posts.map(({
      id, title, link,
    }) => {
      const className = seenPosts.has(id) ? 'fw-normal link-secondary' : 'fw-bold';
      const resultButtons = `<li class="list-group-item d-flex justify-content-between align-itemsstart">
    <a href="${link}" class="${className}" data-id="${id}" data-id-text="${id}" target="_blank">${title}</a>
    <button id = "details" data-bs-toggle="modal" data-bs-target="#modal" 
    class="btn btn-primary btn-sm pull-right" data-id=${id}>${i18next.t('watch')}</button></span></li>`;
      return resultButtons;
    }).join('');

    return `<ul>${listPosts}</ul>`;
  };

  const renderPosts = (stateValue) => {
    elements.posts.innerHTML = `<h3>${i18next.t('posts')}</h3>${getPostsHtml(stateValue)}`;
  };

  const renderModal = (stateValue) => {
    const {
      id, title, link, description,
    } = stateValue.posts
      .find((post) => post.id === stateValue.ui.postId);
    const selectedText = document.querySelector(`[data-id-text="${id}"]`);
    elements.readLink.setAttribute('href', `${link}`);
    selectedText.classList.remove('font-weight-bold');
    elements.modalTitle.textContent = `${title}`;
    elements.modalBody.textContent = `${description}`;
  };

  const renderFormError = (stateValue) => {
    elements.input.classList.add('is-invalid', true);
    elements.feedback.classList.add('text-danger');
    elements.feedback.textContent = i18next.t(`${stateValue.form.error}`);
    elements.input.removeAttribute('readonly');
    elements.button.removeAttribute('disabled');
  };

  const renderLoadingError = (stateValue) => {
    elements.input.classList.add('is-invalid', true);
    elements.feedback.classList.add('text-danger');
    elements.feedback.textContent = i18next.t(`${stateValue.loadingProcess.error}`);
    elements.input.removeAttribute('readonly');
    elements.button.removeAttribute('disabled');
  };

  const router = (value, stateValue) => {
    switch (value) {
      case 'sending':
        renderSendingData();
        break;
      case 'success':
        renderSuccessText();
        break;
      case 'formError':
        renderFormError(stateValue);
        break;
      case 'loadingError':
        renderLoadingError(stateValue);
        break;
      default:
        break;
    }
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'loadingProcess.status':
        router(value, state);
        break;
      case 'feeds': {
        renderFeeds(state);
        break;
      }
      case 'posts': {
        renderPosts(state);
        break;
      }
      case 'ui.postId': {
        renderModal(state);
        break;
      }

      default:
        break;
    }
  });
  return watchedState;
};

export { renderLanguage, watchState };
