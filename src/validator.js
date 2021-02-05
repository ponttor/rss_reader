export default () => {
  alert('chicken');
}

const form = document.querySelector('.form-group');

const render = (state) => {
  const container = document.querySelector('.tasks');
  container.innerHTML = '';
  state.tasks.forEach((task) => {
    const el = document.createElement('div');
    el.classList.add('p-2');
    el.textContent = task.name;
    container.appendChild(el);
  });
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = {
    name: formData.get('name'),
  };
}
// render(state);