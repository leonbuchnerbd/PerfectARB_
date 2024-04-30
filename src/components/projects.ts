import { LitElement, css, html, unsafeCSS} from "lit";
import { map } from 'lit/directives/map.js';
import { customElement, query, state, property } from "lit/decorators.js";
import { TailwindElement } from "../shared/tailwind.element";
import style from './projects.component.scss?inline'; 
import { getElement, removeElement, addElement, editElement } from "../db";
import { openDB, DBSchema } from 'idb';

@customElement("projects-element")
export class ProjectsElement extends TailwindElement(style) {
    @state() projects: Array<{ text: string; color: string; }> = [];
    @query ('#todo-input') inputProject: HTMLInputElement;
    @query ('#project-list') projectList: HTMLInputElement;

  constructor() {
    super(); 
  }

  changeprojectList() {
    const newProjectList = new CustomEvent('newProjectList', {
      detail: {
        list: this.projects
      }
    })
    this.dispatchEvent(newProjectList);
  }

  
  addTodo() {
    const inputText = this.inputProject.value.trim();
    if(inputText !== '') {
        const randomColor = Math.floor(Math.random()*16777215).toString(16);
        const newProject = { text: inputText, color: randomColor };
        this.projects.push(newProject);
        this.requestUpdate();
        this.inputProject.value = '';

        this.changeprojectList(); 
    }
  }

  removeProject(index: number) {
    this.projects.splice(index, 1);
    this.projects = [...this.projects];
    this.changeprojectList(); 
  }

  render() {
    return html`
      <div id="display-box">
        <h3>Projekte</h3>
        <div>
        <input type="text" id="todo-input" />
        <button id="add-todo" @click="${this.addTodo}">Projekt hinzufügen</button>
        <ul id="project-list">
            ${this.projects.map((project, index) => {
                return html`
                <li>
                  <span class="dot" style="background-color: #${project.color};"></span>
                  ${project.text} <span @click="${() => this.removeProject(index)}">✖️</span>
                </li>
                `;
            })}
        </ul>
        </div>
      </div>
    `;
  }
}

/*
function removeTodo(index) {
  todos.splice(index, 1);
  renderTodos();
}

function handleDrop(event) {
  event.preventDefault();
  const fromIndex = event.dataTransfer.getData('text/plain');
  const toIndex = Array.from(todoList.children).indexOf(event.currentTarget);
  const movedTodo = todos.splice(fromIndex, 1)[0];
  todos.splice(toIndex, 0, movedTodo);
  renderTodos();
}

function renderTodos() {
  todoList.innerHTML = '';
  todos.forEach((todo, index) => {
    const todoItem = document.createElement('li');
    todoItem.draggable = true;
    todoItem.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', index);
    });
    const removeButton = document.createElement('span');
    removeButton.textContent = '✖️';
    removeButton.className = 'remove-button';
    removeButton.onclick = () => removeTodo(index);
    todoItem.innerHTML = `
      <span class="dot" style="background-color: #${todo.color}"></span>
      <span class="todo-text">${todo.text}</span>
    `;
    todoItem.appendChild(removeButton);
    todoList.appendChild(todoItem);
  });
}

document.getElementById('add-todo').addEventListener('click', addTodo);
todoList.addEventListener('dragover', (event) => event.preventDefault());
todoList.addEventListener('drop', handleDrop);
*/

getElement