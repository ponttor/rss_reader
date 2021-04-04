import i18next from 'i18next';

const input = document.querySelector('.form-control');
const feedback = document.querySelector('.feedback');
const button = document.querySelector('.btn');
const modal = document.querySelector('#modal');

const renderSuccess = (state) => {
  input.classList.remove('is-invalid');
  feedback.textContent = i18next.t('success');
  feedback.classList.remove('text-danger');
  feedback.classList.add('text-success');
  input.value = '';
  input.focus();

  const list = [];
  const buildFeedPublish = ({ feeds }) => {
    if (state.urls.length === 0) {
      return;
    }
    const htmlItemsList = feeds.map((el) => `<ul>${el.items.map(({
      itemTitle, itemDescription, itemLink, id,
    }) => {
      const resultButtons = `<li class="list-group-item d-flex justify-content-between align-itemsstart"><a href="${itemLink}" class="font-weight-bold" target="_blank">${itemTitle}</a><button id = "details" data-toggle="modal" data-target="#modal" class="btn btn-primary btn-sm pull-right" data-id=${id}>Подробнее</button></span></li>`;
      list.push({
        itemTitle, itemDescription, itemLink, id,
      });
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

    feeds.forEach((el) => {
      el.items.forEach((item) => {
        const selectedButton = document.querySelector(`[data-id="${item.id}"]`);
        selectedButton.addEventListener('click', (e) => {
          e.preventDefault();

          document.querySelector('#readLink').setAttribute('href', `${list[item.id - 1].itemLink}`);
          modal.classList.remove('fade');
          modal.style.display = 'block';
          document.querySelector('.modal-title').textContent = `${list[item.id - 1].itemTitle}`;
          document.querySelector('.modal-body').textContent = `${list[item.id - 1].itemDescription}`;
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
    });
  };

  buildFeedPublish(state);
  button.removeAttribute('disabled');
};

const renderError = (state) => {
  input.classList.add('is-invalid', true);
  feedback.classList.add('text-danger');
  if (state.form.error === 'urlExist') {
    feedback.textContent = i18next.t('urlAlreadyExistError');
  } else if (state.form.error === 'validationError') {
    feedback.textContent = i18next.t('validationError');
  } else if (state.loadingProcess.error === 'parseError') {
    feedback.textContent = i18next.t('parseError');
  } else if (state.loadingProcess.error === 'axiosError') {
    feedback.textContent = i18next.t('netError');
  } else {
    feedback.textContent = i18next.t('unknownError');
  }
  button.removeAttribute('disabled');
};

const renderClick = () => {
  button.setAttribute('disabled', true);
};

export {
  renderSuccess, renderError, renderClick,
};
