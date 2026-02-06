import {
  alertDiv,
  clearBtn,
  fileOptions,
  listDiv,
  submitText,
  textInput,
} from "./DOM_elements.js";
import { Storage } from "./Storage.js";
import { Todo } from "./Todo.js";

let completed = false;
let editFlag = false;
let editID = "";
let editElement = "";

export class UI {
  static async checkItem(btn) {
    let todo = btn.parentElement.parentElement;
    const id = todo.dataset.id;
    if (!todo.classList.contains("todoCompleted")) {
      todo.classList.add("todoCompleted");
      completed = true;
      this.displayAlert("todo completed!", "success");
    } else {
      todo.classList.remove("todoCompleted");
      completed = false;
      this.displayAlert("todo uncompleted!", "danger");
    }
    await Storage.updateDbTodo(id, { completed });
    this.setToDefault();
  }

  static async deleteItem(btn) {
    let todo = btn.parentElement.parentElement;
    const id = todo.dataset.id;
    todo.remove();
    this.displayAlert("todo deleted!", "danger");
    await Storage.deleteDbTodo(id);
    this.setToDefault();

    if (listDiv.children.length === 0) {
      clearBtn.classList.remove("show-container");
    }
  }

  static editItem(btn) {
    editElement = btn.nextElementSibling;
    const element = btn.parentElement;

    editFlag = true;

    if (element.classList.contains("todoCompleted") && editFlag) {
      this.displayAlert("cannot edit a completed todo!", "danger");
    } else {
      textInput.value = editElement.innerHTML;
      submitText.innerText = "Edit";
      editID = element.dataset.id;
    }
  }

  static displayAlert(text, action) {
    alertDiv.innerText = text;
    alertDiv.classList.add(`alert-${action}`);

    setTimeout(function () {
      alertDiv.innerText = "";
      alertDiv.classList.remove(`alert-${action}`);
    }, 1000);
  }

  static setToDefault() {
    textInput.value = "";
    editID = "";
    editFlag = false;
    completed = false;
    submitText.innerText = "Submit";
  }

  static toggleFileMenu() {
    fileOptions.classList.toggle("show-file-options");
  }

  static downloadFile(filename, text) {
    let element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();
    document.body.removeChild(element);
  }

  static async clearTodos() {
    await Storage.clearDbTodos();
    const todos = listDiv.querySelectorAll(".todoDiv");
    todos.forEach(function (todo) {
      listDiv.removeChild(todo);
    });
    clearBtn.classList.remove("show-container");
  }

  appendTodo(todo) {
    const itemDiv = document.createElement("div");
    const datasetAttr = document.createAttribute("data-id");

    itemDiv.classList.add("todoDiv");
    datasetAttr.value = todo.id;
    itemDiv.setAttributeNode(datasetAttr);

    itemDiv.innerHTML = `<i class="fas fa-edit edit-btn"></i>
                           <h4>${todo.text}</h4>
                           <div><i class="fas fa-check-square fa-2x check-btn"></i>
                              <i class="fas fa-minus-square fa-2x del-btn"></i></div>`;

    itemDiv.addEventListener("click", function (e) {
      const el = e.target;
      if (el.classList.contains("edit-btn")) {
        UI.editItem(el);
      } else if (el.classList.contains("check-btn")) {
        UI.checkItem(el);
      } else if (el.classList.contains("del-btn")) {
        UI.deleteItem(el);
      }
    });

    if (todo.completed) itemDiv.classList.add("todoCompleted");

    listDiv.appendChild(itemDiv);
  }

  async getItems() {
    let Items = await Storage.getDbTodos();

    Items.forEach((Item) => {
      const text = Item.text;
      const id = Item.id;
      const completed = Item.completed;
      const todo = new Todo(text, id, completed);
      this.appendTodo(todo);
    });
    if (Items.length > 0) clearBtn.classList.add("show-container");
  }
}

export { completed, editElement, editFlag, editID };
