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

export class UI {
  constructor() {
    this.completed = false;
    this.editFlag = false;
    this.editID = "";
    this.editElement = "";
  }

  async checkItem(btn) {
    try {
      const todo = btn.parentElement.parentElement;
      const id = todo.dataset.id;

      if (!todo.classList.contains("todoCompleted")) {
        todo.classList.add("todoCompleted");
        this.completed = true;
        UI.displayAlert("todo completed!", "success");
      } else {
        todo.classList.remove("todoCompleted");
        this.completed = false;
        UI.displayAlert("todo uncompleted!", "danger");
      }

      await Storage.updateDbTodo(id, { completed: this.completed });
      this.setToDefault();
    } catch (error) {
      console.error("Failed to update todo:", error);
      UI.displayAlert(
        "Failed to update todo, please try again later.",
        "danger",
      );
    }
  }

  async deleteItem(btn) {
    try {
      const todo = btn.parentElement.parentElement;
      const id = todo.dataset.id;
      await Storage.deleteDbTodo(id);
      todo.remove();
      UI.displayAlert("todo deleted!", "danger");

      this.setToDefault();

      if (listDiv.children.length === 0) {
        clearBtn.classList.remove("show-container");
      }
    } catch (error) {
      UI.displayAlert(
        "Failed to delete todo, please try again later.",
        "danger",
      );
    }
  }

  editItem(btn) {
    this.editElement = btn.nextElementSibling;
    const element = btn.parentElement;

    this.editFlag = true;

    if (element.classList.contains("todoCompleted") && this.editFlag) {
      UI.displayAlert("cannot edit a completed todo!", "danger");
    } else {
      textInput.value = this.editElement.innerHTML;
      submitText.innerText = "Edit";
      this.editID = element.dataset.id;
    }
  }

  setToDefault() {
    textInput.value = "";
    this.editID = "";
    this.editFlag = false;
    this.completed = false;
    submitText.innerText = "Submit";
  }

  static toggleFileMenu() {
    fileOptions.classList.toggle("show-file-options");
  }

  static downloadFile(filename, text) {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text),
    );
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();
    document.body.removeChild(element);
  }

  static async clearTodos() {
    try {
      await Storage.clearDbTodos();
      const todos = listDiv.querySelectorAll(".todoDiv");
      todos.forEach(function (todo) {
        listDiv.removeChild(todo);
      });
      clearBtn.classList.remove("show-container");
    } catch (error) {
      UI.displayAlert(
        "Failed to clear todos, please try again later.",
        "danger",
      );
    }
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

    itemDiv.addEventListener("click", (e) => {
      const el = e.target;
      if (el.classList.contains("edit-btn")) {
        this.editItem(el);
      } else if (el.classList.contains("check-btn")) {
        this.checkItem(el);
      } else if (el.classList.contains("del-btn")) {
        this.deleteItem(el);
      }
    });

    if (todo.completed) itemDiv.classList.add("todoCompleted");

    listDiv.appendChild(itemDiv);
  }

  async getItems() {
    try {
      const items = await Storage.getDbTodos();

      items.forEach((item) => {
        const text = item.text;
        const id = item.id;
        const completed = item.completed;
        const todo = new Todo(text, id, completed);
        this.appendTodo(todo);
      });
      if (items.length > 0) clearBtn.classList.add("show-container");
    } catch (error) {
      console.error("Failed to load todos:", error);
      UI.displayAlert("Cannot load todos, please try again later.", "danger");
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
}
