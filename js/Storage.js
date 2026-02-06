export class Storage {
  static apiBase = "http://localhost:3000/api/todos";

  static async getDbTodos() {
    const response = await fetch(this.apiBase);
    if (!response.ok) {
      throw new Error("Failed to load todos");
    }
    return response.json();
  }

  static async addDbTodo(text) {
    const response = await fetch(this.apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      throw new Error("Failed to create todo");
    }
    return response.json();
  }

  static async updateDbTodo(id, updates) {
    const response = await fetch(`${this.apiBase}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error("Failed to update todo");
    }
    return response.json();
  }

  static async deleteDbTodo(id) {
    const response = await fetch(`${this.apiBase}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete todo");
    }
    return response.json();
  }

  static async clearDbTodos() {
    const response = await fetch(this.apiBase, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to clear todos");
    }
    return response.json();
  }

  static async addDbTodosFromFile(fileItems) {
    const filteredItems = fileItems
      .map((fileItem) => fileItem.trim())
      .filter((fileItem) => fileItem.length > 0);
    for (const fileItem of filteredItems) {
      await this.addDbTodo(fileItem);
    }
  }
}
