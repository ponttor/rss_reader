import onChange from 'on-change';

import {
  renderError, renderSendingData, renderSuccessText,
  renderFeeds, renderPosts,
} from './render.js';

const watchState = (state) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'loadingProcess.status':
        if (value === 'sending') {
          renderSendingData();
        } else if (value === 'success') {
          renderSuccessText(state);
        } else if (value === 'failed') {
          renderError(state);
        }
        break;
      case 'feeds': {
        renderFeeds(state);
        break;
      }
      case 'posts': {
        renderPosts(state);
        break;
      }

      default:
        break;
    }
  });
  return watchedState;
};
export default watchState;
