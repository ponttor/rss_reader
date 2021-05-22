/* eslint-disable no-param-reassign */
import i18next from 'i18next';
import onChange from 'on-change';

const renderLanguage = () => {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = i18next.t(`${el.dataset.i18n}`);
  });
};

const watchState = (elements, state) => {
  const renderSuccessText = (el) => {
    el.input.classList.remove('is-invalid');
    el.feedback.textContent = i18next.t('success');
    el.feedback.classList.remove('text-danger');
    el.feedback.classList.remove('text-info');
    el.feedback.classList.add('text-success');
    el.input.value = '';
    el.input.focus();
    el.button.removeAttribute('disabled');
    el.input.removeAttribute('readonly');
  };

  const renderSendingData = (el) => {
    el.input.setAttribute('readonly', true);
    el.button.setAttribute('disabled', true);
    el.feedback.classList.remove('text-danger');
    el.feedback.classList.remove('text-success');
    el.feedback.classList.add('text-info');
    el.feedback.textContent = i18next.t('loading');
  };

  const renderFeeds = (el, stateValue) => {
    const feedsContent = stateValue.feeds.map((feed) => {
      const title = `<h3>${feed.title}</h3>`;
      const description = `<p>${feed.description}</p>`;
      const titleline = `<li class="list-group-item">${title}${description}</li>`;
      return titleline;
    }).join('');
    const htmlFeeds = `<h3>${i18next.t('feeds')}</h3><ul>${feedsContent}</ul>`;
    el.feeds.innerHTML = `${htmlFeeds}`;
  };

  const renderPosts = (el, stateValue) => {
    const htmlposts = `<ul>${stateValue.posts.map(({
      id, title, link,
    }) => {
      const resultButtons = `<li class="list-group-item d-flex justify-content-between align-itemsstart">
    <a href="${link}" class="font-weight-bold" target="_blank">${title}</a>
    <button id = "details" data-toggle="modal" data-target="#modal" 
    class="btn btn-primary btn-sm pull-right" data-id=${id}>Подробнее</button></span></li>`;
      return resultButtons;
    }).join('')}</ul>`;
    el.posts.innerHTML = `<h3>${i18next.t('posts')}</h3>${htmlposts}`;
    state.posts.forEach(({
      id, title, link, description,
    }) => {
      const selectedButton = document.querySelector(`[data-id="${id}"]`);
      selectedButton.addEventListener('click', (e) => {
        e.preventDefault();

        el.readLink.setAttribute('href', `${link}`);
        el.modal.classList.remove('fade');
        el.modal.style.display = 'block';
        el.modalTitle.textContent = `${title}`;
        el.modalBody.textContent = `${description}`;
        const fade = document.createElement('div');
        fade.classList.add('modal-backdrop');
        fade.classList.add('fade');
        fade.classList.add('show');
        document.body.appendChild(fade);
        el.modalClose.addEventListener('click', (event) => {
          event.preventDefault();
          el.modal.classList.add('fade');
          el.modal.style.display = 'none';
          document.body.removeChild(fade);
        });
        el.closeButton.addEventListener('click', (event) => {
          event.preventDefault();
          el.modal.classList.add('fade');
          el.modal.style.display = 'none';
          document.body.removeChild(fade);
        });
        document.body.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') {
            el.modal.classList.add('fade');
            el.modal.style.display = 'none';
            document.body.removeChild(fade);
          }
        });
      });
    });
  };

  const renderFormError = (el, stateValue) => {
    el.button.setAttribute('disabled', true);
    el.input.classList.add('is-invalid', true);
    el.feedback.classList.add('text-danger');
    el.feedback.textContent = i18next.t(`${stateValue.form.error}`);
    el.input.removeAttribute('readonly');
    el.button.removeAttribute('disabled');
  };

  const renderLoadingError = (el, stateValue) => {
    el.button.setAttribute('disabled', true);
    el.input.classList.add('is-invalid', true);
    el.feedback.classList.add('text-danger');
    if ((i18next.t(`${stateValue.loadingProcess.error}`)) && (stateValue.loadingProcess.error !== 'Network Error')) {
      el.feedback.textContent = i18next.t(`${stateValue.loadingProcess.error}`);
    } else {
      el.feedback.textContent = i18next.t('networkError');
    }
    el.input.removeAttribute('readonly');
    el.button.removeAttribute('disabled');
  };

  const router = (value, stateValue) => {
    switch (value) {
      case 'sending':
        renderSendingData(elements);
        break;
      case 'success':
        renderSuccessText(elements);
        break;
      case 'formError':
        renderFormError(elements, stateValue);
        break;
      case 'loadingError':
        renderLoadingError(elements, stateValue);
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
        renderFeeds(elements, state);
        break;
      }
      case 'posts': {
        renderPosts(elements, state);
        break;
      }

      default:
        break;
    }
  });
  return watchedState;
};

export { renderLanguage, watchState };
