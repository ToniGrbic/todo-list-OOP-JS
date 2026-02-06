import {
  clearBtn,
  downloadButton,
  dropdownMenu,
  fileChoice,
  fileName,
  fileNameInput,
  fileOptions,
  inputFile,
  listDiv,
  openFile,
  options,
  submit,
  textInput,
} from "./domElements.js";

import { Storage } from "./api.js";
import { Todo } from "./todo.js";
import { UI } from "./UI.js";

document.addEventListener("DOMContentLoaded", async function () {
  const ui = new UI();
  await ui.getItems();

  dropdownMenu.addEventListener("click", function (e) {
    ui.toggleFileMenu();
  });

  fileOptions.addEventListener("click", function (e) {
    if (e.target.classList.contains("Save-as")) {
      fileName.classList.toggle("show-fileName");

      downloadButton.addEventListener("click", async function (e) {
        let todos = Storage.getDbTodos();
        let text = "";
        text = (await todos).map((todo) => todo.text).join("\n");
        text = "Todos:\n" + text;
        let fileName = fileNameInput.value;
        ui.downloadFile(fileName, text);
        fileNameInput.value = "";
      });
    } else if (e.target.classList.contains("Open")) {
      openFile.classList.toggle("show-open-file");
      inputFile.addEventListener(
        "change",
        async function (e) {
          let fileName = inputFile.files[0].name;
          fileChoice.innerText = "current file: " + fileName;

          let todos = await Storage.getDbTodos();
          if (todos.length != 0) {
            await ui.clearTodos();
          }
          const reader = new FileReader();
          reader.readAsText(inputFile.files[0]);

          reader.onload = async function () {
            let fileItems = reader.result.split("\n").slice(1);
            await Storage.addDbTodosFromFile(fileItems);
            await ui.getItems();
            UI.displayAlert("list opened from file", "success");
          };
        },
        false,
      );
    }
  });

  submit.addEventListener("click", async function (e) {
    e.preventDefault();
    const input_text = textInput.value;
    //different submit cases
    if (input_text && !ui.editFlag) {
      try {
        const createdTodo = await Storage.addDbTodo(input_text);
        const todo = new Todo(
          createdTodo.text,
          createdTodo.id,
          createdTodo.completed,
        );
        ui.appendTodo(todo);
        clearBtn.classList.add("show-container");
        UI.displayAlert("todo added!", "success");
        ui.setToDefault();
      } catch (error) {
        UI.displayAlert(
          "Failed to add todo, please try again later.",
          "danger",
        );
      }
    } else if (input_text && ui.editFlag) {
      ui.editElement.innerHTML = input_text;
      UI.displayAlert("todo edited!", "success");
      await Storage.updateDbTodo(ui.editID, { text: input_text });
      ui.setToDefault();
    } else {
      UI.displayAlert("please submit a todo!", "danger");
    }
  });

  options.addEventListener("click", (e) => {
    const todos = listDiv.querySelectorAll(".todoDiv");
    todos.forEach(function (todo) {
      switch (e.target.value) {
        case "All":
          todo.style.display = "flex";
          break;
        case "Completed":
          if (todo.classList.contains("todoCompleted")) {
            todo.style.display = "flex";
          } else {
            todo.style.display = "none";
          }
          break;
        case "Uncompleted":
          if (!todo.classList.contains("todoCompleted")) {
            todo.style.display = "flex";
          } else {
            todo.style.display = "none";
          }
          break;
      }
    });
  });

  clearBtn.addEventListener("click", async function (e) {
    e.preventDefault();

    if (confirm("Are you sure?")) {
      await ui.clearTodos();
      ui.setToDefault();
      UI.displayAlert("todos removed!", "success");
    }
  });
});
