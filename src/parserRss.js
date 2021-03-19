export default (rss) => {
  const parser = new DOMParser();
  const rssDoc = parser.parseFromString(rss, 'text/xml');
  console.log(rssDoc);
  if (rssDoc === undefined) {
    return 'parcingError';
  }
  const title = rssDoc.querySelector('title');
  // console.log(title);
  const description = rssDoc.querySelector('description');
  // console.log(description);
  const itemsList = rssDoc.querySelectorAll('item');

  const items = [];
  itemsList.forEach((item) => {
    const itemTitle = item.querySelector('title').textContent;
    const itemLink = item.querySelector('link').textContent;
    const itemDescription = item.querySelector('description').textContent;
    items.unshift({
      itemTitle, itemLink, itemDescription,
    });
  });

  return {
    title: title.textContent,
    description: description.textContent,
    items,
    // parcingError
  };
};
