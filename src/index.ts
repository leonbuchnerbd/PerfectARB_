import { html } from "lit";
import { customElement, query, state, property } from "lit/decorators.js";
import "./components/calendar";
import "./components/display";
import "./components/projects";
import { TailwindElement } from "./shared/tailwind.element";
import style from "./index.css?inline";
import "./db";
import { getCurrentDate, getStorageProjects, getStorageTasks, setCurrentDate, setStorageProjects, setStorageTask } from "./db";
import { exportArr, makeExport, projectsString } from "./export";
//import { startDB, addItemToStore, getAllTasks} from "./db";


@customElement("start-element")
export class StartElement extends TailwindElement(style) {
  @state () clickedDate: Date;
  @state () clickedDateString : String;
  @state () projects : Project [] = getStorageProjects();
  @state () tasks : Task [] = [];
  @state () tasksToShow : Task [] = [];
  @query ('#modal') modal: HTMLDialogElement;
  @query ('#task') inputTask: HTMLInputElement;
  @query ('#projectSelect') projectSelect: HTMLInputElement;
  @query ('#mandays') inputMandays: HTMLInputElement;

  constructor() {
    
    super();
    this.tasks = getStorageTasks();
    this.clickedDate = getCurrentDate();
    this.filterTasks();
  }


  private normalizeDate(date: Date){
    return date.toLocaleString('de-DE');
  }

  private handleClickDate(e: CustomEvent) {
    this.tasksToShow = [];
    this.clickedDate = e.detail.date;
    setCurrentDate(this.clickedDate);
    
    this.filterTasks();
    //console.log(this.tasksToShow);
  }

  filterTasks() {
    this.tasksToShow = getStorageTasks()?.filter((task) => {
      const taskDate = new Date(task.date);
      return (this.normalizeDate(this.clickedDate)  === this.normalizeDate(taskDate));
    })
  }

  private openAddModal(e:CustomEvent) {
    this.modal.showModal();
    let date = e.detail.date;
    this.clickedDateString = date.toLocaleString('de-de', { day: 'numeric', month: 'long' });
  }

  closeAddModal() {
    this.modal.close();
  }

  private addNewTask(e:CustomEvent) {
    const selectedProject = this.projectSelect.value;
    const project = this.projects.find((project) => {
      return project.text === selectedProject;
    })
    this.modal.close();
    const newTask : Task = {
      id: crypto.randomUUID(),
      text: this.inputTask.value.trim(),
      date: this.clickedDate,
      project: project,
      mandays: Number(this.inputMandays.value)
    }
    this.tasks.push(newTask);
    setStorageTask(this.tasks);
    window.location.reload();
    this.clickedDate = newTask.date;
  }

  updateProjectList(e: CustomEvent) {
    const projectList = e.detail.list;
    this.projects = projectList;
    setStorageProjects(this.projects);
  }

  downloadFile() {
    makeExport();
    const link = document.createElement("a");
    const content = `${projectsString}`;
    const file = new Blob([content], {type: 'text/plain'});
    link.href = URL.createObjectURL(file);
    link.download = "arb.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  }



  updateTaskList (e: CustomEvent) {
    console.log("Task updated");
    const tasksList = e.detail.list;
    this.tasks = tasksList;
    setStorageTask(this.tasks);
  }

  
  render() {
    return html`
    <div class="mx-20 my-16">
      <div class="flex flex-row justify-between w-full">
      <calendar-element class="w-full"  @clickedDate=${this.handleClickDate} @addTask=${this.openAddModal}></calendar-element>
      <projects-element class="ml-3 mt-20" @newProjectList=${this.updateProjectList}></projects-element>
      </div>
      <display-element day=${this.clickedDate} .tasks=${this.tasksToShow} @newTasksList=${this.updateTaskList}></display-element>
      <button class="hover:bg-blue-700 bg-blue-900 text-white text-base py-2 px-4 rounded-md inline-flex items-center mt-5" @click=${this.downloadFile}>ARB exportieren</button>
    </div>
      
      <dialog id="modal" class="modal">
        <div class="modal-box">
        <h3 class="font-bold text-xl mb-4">Was habe ich am ${this.clickedDateString} gemacht?</h3>
        <label for="task" class="font-semibold mt-4">Tätigkeit:</label>
        <input type="text" id="task" name="task" maxlength="80" class="w-full border-2 border-blue-700 rounded-md p-1"><br>
        <label for="projectSelect" class="font-semibold my-3">Dazugehöriges Projekt: </label><br>
            <select style="border-width: 3px;" class="border-blue-700 rounded-md p-1" name="projectSelect" id="projectSelect">
              ${this.projects?.map((project) => {
                return html`<option value = ${project.text}>${project.text}</option>`
              })}
            </select><br>
        <label for="mandays" class="font-semibold my-3">Stunden:</label><br>
        <input style="border-width: 3px;" class="border-blue-700 rounded-md p-1" type="number" id="mandays" name="mandays"min="0.5" max="8" step="0.5">
        <form method="dialog" class="modal-backdrop">
        <div class="flex flex-row justify-between mt-4">
          <button @click=${this.addNewTask} class="w-28 text-white rounded-md p-1 bg-blue-900">Hinzufügen</button>
          <button @click=${this.closeAddModal} class="w-28 text-white rounded-md p-1 bg-blue-900">Abbrechen</button>
          </div>
        </form>
        </div>
      </dialog>
    `;
  }
} 

