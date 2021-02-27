import axios from 'axios';
import parse from './parserRss.js';

axios.get('https://ru.hexlet.io/lessons.rss')
  .then((response) => {
    const { title, description, items } = parse(response.data);
    // const newRss = { title, description, posts };
    // state.rss.push(newRss);
    // console.log(`title: ${title}, description: ${description}, items: ${items}`);
  })
  .catch((error) => {
    console.log(error);
    throw new Error('The received data is not good');
  })
  .then(function () {
    // always executed
  });

// fetch(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent('https://wikipedia.org')}`)
//   .then(response => {
//     if (response.ok) return response.json();
//     throw new Error('Network response was not ok.');
//   })
//   .then(data => console.log(data.contents));
