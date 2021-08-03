export default (rss) => {
  const parser = new DOMParser();
  const rssDoc = parser.parseFromString(rss, 'text/xml');
  if (rssDoc.querySelector('parsererror') !== null) {
    const error = new Error('parserError');
    error.isParsingError = true;
    throw error;
  }
  const title = rssDoc.querySelector('title');
  const description = rssDoc.querySelector('description');
  const itemsList = rssDoc.querySelectorAll('item');

  const items = [...itemsList].map((item) => {
    const itemTitle = item.querySelector('title').textContent;
    const itemLink = item.querySelector('link').textContent;
    const itemDescription = item.querySelector('description').textContent;
    return {
      title: itemTitle, link: itemLink, description: itemDescription,
    };
  });

  return {
    title: title.textContent,
    description: description.textContent,
    items,
  };
};
