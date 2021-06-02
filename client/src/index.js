import { defaultModules, success } from '@pnotify/core';
import * as PNotifyMobile from '@pnotify/mobile';
import _ from 'lodash';

import api from './api';

import '@pnotify/core/dist/BrightTheme.css';
import '@pnotify/core/dist/PNotify.css';
import './sass/main.scss';

let currPage = 1;
const perPage = 50;
let observerElement;

const observer = new IntersectionObserver(elements => {
  elements.forEach(element => {
    if (element.intersectionRatio === 1) {
      api.getAccounts(++currPage, perPage).then(accounts => {
        buildAccounts(accounts);
        observer.unobserve(observerElement);
        // TODO - if (account.length < perpage) then not obsers
        observerElement = document.querySelector('[data-accounts-list] li:last-child');
        observer.observe(observerElement);
      });
    }
  });
});

const onUserAgeChange = async e => {
  const isPlus = e.target.dataset.plus === '';
  const id = e.target.dataset.id;
  const user = api.getApiUsers().find(u => u.id === id);
  const age = isPlus ? user.age + 1 : user.age - 1;
  const updatedUsers = await api.changeUserAge(id, user.name, age);
  buildUl(updatedUsers);
};

const onAddUser = async () => {
  const name = document.querySelector('[data-name]').value;
  const age = document.querySelector('[data-age]').value;
  document.querySelector('[data-name]').value = '';
  document.querySelector('[data-age]').value = '';
  const updatedUsers = await api.addUser(name, age);
  buildUl(updatedUsers);
  success('User was added successfully');
};

const onDataFiltered = _.debounce(async e => {
  const filteredUsers = await api.filterUsers(e.target.value);
  buildUl(filteredUsers);
}, 500);

const onLoadMoreClick = async e => {
  const accounts = await api.getAccounts(++currPage, perPage);
  buildAccounts(accounts);
  e.target.remove();
  observerElement = document.querySelector('[data-accounts-list] li:last-child');
  observer.observe(observerElement);
};

const buildUl = users => {
  const lis = Object.values(users)
    .map(
      ({ id, name, age }) =>
        `<li>${name} - <button data-id="${id}" data-plus>+</button>${age}<button data-id="${id}" data-minus>-</button> y.o.</li>`,
    )
    .join('');
  const ul = `<ul>${lis}</ul>`;
  document.querySelector('[data-users-list]').innerHTML = ul;
};

const buildAccounts = accounts => {
  var fragment = new DocumentFragment();
  Object.values(accounts).forEach(({ email, name }) => {
    const li = document.createElement('li');
    li.innerText = `${name} - ${email}`;
    fragment.appendChild(li);
  });
  document.querySelector('[data-accounts-list] ul').appendChild(fragment);
};

defaultModules.set(PNotifyMobile, {});
api.getUsers().then(buildUl);
api.getAccounts(currPage, perPage).then(buildAccounts);

document.querySelector('[data-users-list]').addEventListener('click', onUserAgeChange);
document.querySelector('[data-filter]').addEventListener('input', onDataFiltered);
document.querySelector('button').addEventListener('click', onAddUser);
document.querySelector('[data-load-accounts]').addEventListener('click', onLoadMoreClick);
