const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
var format = require("date-fns/format");
var isValid = require("date-fns/isValid");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertTodoDbObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
    category: dbObject.category,
    dueDate: dbObject.due_date,
  };
};

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};
const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const hasCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};
app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status, category } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND priority = '${priority}';`;
      break;
    case hasPriorityAndCategoryProperties(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND category = '${category}'
        AND priority = '${priority}';`;
      break;

    case hasCategoryAndStatusProperties(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND category = '${category}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND priority = '${priority}';`;
      break;
    case hasCategoryProperty(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND category = '${category}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});

app.get("/test/", async (request, response) => {
  console.log(request.params);
  const getAllTodoList = `SELECT *
      FROM todo`;
  const todoList = await db.all(getAllTodoList);
  response.send(todoList);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodo = `SELECT *
    FROM todo
    WHERE id='${todoId}'`;
  const result = await db.get(getTodo);
  console.log(response);
  const responseObj = convertTodoDbObjectToResponseObject(result);
  response.send(responseObj);
});
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const formattedDate = format(new Date(date), "yyyy-MM-dd");
  console.log(isValid(formattedDate));
  //   if (!isValid(formattedDate)) {
  //     response.send("Invalid ");
  //     response.status = 400;
  //   }
  const getTodo = `SELECT*
      FROM todo
      WHERE due_date>'${formattedDate}'`;
  const result = await db.all(getTodo);
  response.send(result);
});
// app.post("/todos/", async (request, response) => {
//   const { id, todo, priority, status, category, dueDate } = request.body;
//   console.log(dueDate);
//   const addTodo = `INSERT INTO todo(id,todo,priority,status,category,due_date)
//   VALUES('${id}',
//   '${todo}',
//   '${priority}',
//   '${status}',
//   '${category}',
//   '${dueDate}')`;
//   const result = await db.run(addTodo);
//   console.log(result);
//   response.send("Todo Successfully Added");
// });
// app.put("/todos/:todoId/", async (request, response) => {
//   const { todo } = request.body;
//   const { todoId } = request.params;
//   const addTodo = `UPDATE todo
//   SET todo='${todo}'
//   WHERE id='${todoId}'`;
//   const result = await db.run(addTodo);
//   console.log(result);
//   response.send("Todo Updated");
// });
// app.put("/todos/:todoId/", async (request, response) => {
//   const { priority } = request.body;
//   const { todoId } = request.params;
//   const addTodo = `UPDATE todo
//   SET priority='${todo}'
//   WHERE id='${todoId}'`;
//   const result = await db.run(addTodo);
//   console.log(result);
//   response.send("Priority Updated");
// });

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const addTodo = `DELETE FROM todo WHERE id='${todoId}'`;
  await db.run(addTodo);
  response.send("Todo Deleted");
});

module.exports = app;
