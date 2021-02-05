import '../_custom.scss';
// import '.style.css'

// const { addDevServerEntrypoints } = require("webpack-dev-server");

const button = document.querySelector('.btn');
const input = document.querySelector('.form-control');

const state = {};

const handleInput = (e) => {
  e.preventDefault();
  state.input = e.target.value;
  console.log(state.input);
};

const handleClick = (e) => {
  e.preventDefault();
  // input.removeClass('action');
  input.classList.add('is-invalid');
  // alert('ok');
};

input.addEventListener('input', handleInput);

button.addEventListener('click', handleClick);
