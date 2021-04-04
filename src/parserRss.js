import _ from 'lodash';

export default (rss) => {
  const parser = new DOMParser();
  const rssDoc = parser.parseFromString(rss, 'text/xml');
  if (rssDoc.querySelector('parsererror') !== null) {
    throw Error('parse xml error');
  }
  const title = rssDoc.querySelector('title');
  const description = rssDoc.querySelector('description');
  const itemsList = rssDoc.querySelectorAll('item');

  const items = [];
  itemsList.forEach((item) => {
    const itemTitle = item.querySelector('title').textContent;
    const itemLink = item.querySelector('link').textContent;
    const itemDescription = item.querySelector('description').textContent;
    const id = _.uniqueId();
    items.push({
      itemTitle, itemLink, itemDescription, id,
    });
  });

  return {
    title: title.textContent,
    description: description.textContent,
    items,
  };
};
