import { tasksReducer, TasksStateType, tasksThunks } from "features/TodolistsList/tasks.reducer"
import { TaskPriorities, TaskStatuses } from "api/todolists-api"
import { todolistsActions } from "features/TodolistsList/todolists.reducer"
import { nanoid } from "@reduxjs/toolkit"
import { ActionForTest } from "../../common/type/ActionForTest"

let startState: TasksStateType = {}
beforeEach(() => {
  startState = {
    todolistId1: [
      {
        id: "1",
        title: "CSS",
        status: TaskStatuses.New,
        todoListId: "todolistId1",
        description: "",
        startDate: "",
        deadline: "",
        addedDate: "",
        order: 0,
        priority: TaskPriorities.Low,
      },
      {
        id: "2",
        title: "JS",
        status: TaskStatuses.Completed,
        todoListId: "todolistId1",
        description: "",
        startDate: "",
        deadline: "",
        addedDate: "",
        order: 0,
        priority: TaskPriorities.Low,
      },
      {
        id: "3",
        title: "React",
        status: TaskStatuses.New,
        todoListId: "todolistId1",
        description: "",
        startDate: "",
        deadline: "",
        addedDate: "",
        order: 0,
        priority: TaskPriorities.Low,
      },
    ],
    todolistId2: [
      {
        id: "1",
        title: "bread",
        status: TaskStatuses.New,
        todoListId: "todolistId2",
        description: "",
        startDate: "",
        deadline: "",
        addedDate: "",
        order: 0,
        priority: TaskPriorities.Low,
      },
      {
        id: "2",
        title: "milk",
        status: TaskStatuses.Completed,
        todoListId: "todolistId2",
        description: "",
        startDate: "",
        deadline: "",
        addedDate: "",
        order: 0,
        priority: TaskPriorities.Low,
      },
      {
        id: "3",
        title: "tea",
        status: TaskStatuses.New,
        todoListId: "todolistId2",
        description: "",
        startDate: "",
        deadline: "",
        addedDate: "",
        order: 0,
        priority: TaskPriorities.Low,
      },
    ],
  }
})

//region examples
/**
 * type AddTaskType = Omit<ReturnType<typeof tasksThunks.addTask.fulfilled>, "meta">
 *
 * type testData<G extends { a: number; b: number }> = {
 *   date: string
 *   myObject: G
 * }
 *
 * const a: testData<{ a: number; b: number; c: number }> = {
 *   date: "2020-01-01",
 *   myObject: {
 *     a: 123,
 *     b: 134,
 *     c: 1234,
 *   },
 * }
 *
 * (...args: any) => any
 *
 *
 * type MyFunction<T extends {}, K extends keyof T> = (a: T, b: K) => T[K]
 *
 * const obj: { a: number; b: string } = {
 *   a: 123,
 *   b: "14rqwfr",
 * }
 * const test: MyFunction<typeof obj, "b"> = (obj, key) => {
 *   return obj[key]
 * }
 */

/**
 *
 *   function identity<Type>(arg: Type): Type {
 *     if (typeof arg === "number") {
 *       return (arg + 5) as any
 *     }
 *     return arg
 *   }
 *
 *   let myIdentity: <Type>(arg: Type) => Type = identity
 *   const num = myIdentity<number>(5)
 *
 *
 *
 *   function create<T extends number, U extends string>(element: T, children: U[]): U[]{
 *
 *     return []
 *   }
 *
 */
//endregion examples
/**
 * https://youtu.be/UAWORfJmSxI?t=9563
 */
test("correct task should be deleted from correct array", () => {
  type RemoveTaskType = ActionForTest<typeof tasksThunks.removeTask.fulfilled>

  const action: RemoveTaskType = {
    type: tasksThunks.removeTask.fulfilled.type,
    payload: {
      taskId: "2",
      todolistId: "todolistId2",
    },
  }

  const endState = tasksReducer(startState, action)

  expect(endState["todolistId1"].length).toBe(3)
  expect(endState["todolistId2"].length).toBe(2)
  expect(endState["todolistId2"].every((t) => t.id !== "2")).toBeTruthy()
})

test("correct task should be added to correct array", () => {
  type AddTaskType = Omit<ReturnType<typeof tasksThunks.addTask.fulfilled>, "meta">

  const action: AddTaskType = {
    type: tasksThunks.addTask.fulfilled.type,
    payload: {
      task: {
        todoListId: "todolistId2",
        title: "juce",
        addedDate: "",
        deadline: "",
        description: "",
        status: TaskStatuses.New,
        priority: TaskPriorities.Low,
        startDate: "",
        id: "",
        order: 0,
      },
    },
  }

  const endState = tasksReducer(startState, action)

  expect(endState["todolistId1"].length).toBe(3)
  expect(endState["todolistId2"].length).toBe(4)
  expect(endState["todolistId2"][0].id).toBeDefined()
  expect(endState["todolistId2"][0].title).toBe("juce")
  expect(endState["todolistId2"][0].status).toBe(TaskStatuses.New)
})

test("status of specified task should be changed", () => {
  //todo создаем тип
  type UpdateTaskType = ActionForTest<typeof tasksThunks.updateTask.fulfilled>
  //todo создаем объект
  const action: UpdateTaskType = {
    type: tasksThunks.updateTask.fulfilled.type,
    payload: {
      taskId: "2",
      domainModel: { status: TaskStatuses.New },
      todolistId: "todolistId2",
    },
  }
  //todo передаем объект в редюсер
  const endState = tasksReducer(startState, action)
  //todo смотрим тесты
  expect(endState["todolistId1"][1].status).toBe(TaskStatuses.Completed)
  expect(endState["todolistId2"][1].status).toBe(TaskStatuses.New)
})

test("title of specified task should be changed", () => {
  //todo создаем тип
  type UpdateTaskType = ActionForTest<typeof tasksThunks.updateTask.fulfilled>
  //todo создаем объект
  const action: UpdateTaskType = {
    type: tasksThunks.updateTask.fulfilled.type,
    payload: {
      taskId: "2",
      domainModel: { title: "yougurt" },
      todolistId: "todolistId2",
    },
  }

  const endState = tasksReducer(startState, action)

  expect(endState["todolistId1"][1].title).toBe("JS")
  expect(endState["todolistId2"][1].title).toBe("yougurt")
  expect(endState["todolistId2"][0].title).toBe("bread")
})

test("new array should be added when new todolist is added", () => {
  const action = todolistsActions.addTodolist({
    todolist: {
      id: "blabla",
      title: "new todolist",
      order: 0,
      addedDate: "",
    },
  })

  const endState = tasksReducer(startState, action)

  const keys = Object.keys(endState)
  const newKey = keys.find((k) => k != "todolistId1" && k != "todolistId2")
  if (!newKey) {
    throw Error("new key should be added")
  }

  expect(keys.length).toBe(3)
  expect(endState[newKey]).toEqual([])
})

test("propertry with todolistId should be deleted", () => {
  const action = todolistsActions.removeTodolist({ id: "todolistId2" })

  const endState = tasksReducer(startState, action)

  const keys = Object.keys(endState)

  expect(keys.length).toBe(1)
  expect(endState["todolistId2"]).not.toBeDefined()
})

test("empty arrays should be added when we set todolists", () => {
  const action = todolistsActions.setTodolists({
    todolists: [
      { id: "1", title: "title 1", order: 0, addedDate: "" },
      { id: "2", title: "title 2", order: 0, addedDate: "" },
    ],
  })

  const endState = tasksReducer({}, action)

  const keys = Object.keys(endState)

  expect(keys.length).toBe(2)
  expect(endState["1"]).toBeDefined()
  expect(endState["2"]).toBeDefined()
})

test("tasks should be fetched and added for todolist", () => {
  const action = tasksThunks.fetchTasks.fulfilled(
    { tasks: startState["todolistId1"], todolistId: "todolistId1" },
    nanoid(),
    { todolistId: "todolistId1" },
  )

  const endState = tasksReducer(
    {
      todolistId2: [],
      todolistId1: [],
    },
    action,
  )

  expect(endState["todolistId1"].length).toBe(3)
  expect(endState["todolistId2"].length).toBe(0)
})

test("tasks should be fetched and added for todolist-2", () => {
  type FetchTaskAction = ActionForTest<typeof tasksThunks.fetchTasks.fulfilled>

  const action: FetchTaskAction = {
    type: tasksThunks.fetchTasks.fulfilled.type,
    payload: { tasks: startState["todolistId1"], todolistId: "todolistId1" },
  }

  const endState = tasksReducer(
    {
      todolistId2: [],
      todolistId1: [],
    },
    action,
  )

  //  2 способ as FetchTaskAction
  // const endState = tasksReducer(
  //   {
  //     todolistId2: [],
  //     todolistId1: []
  //   },
  //   {
  //     type: tasksThunks.fetchTasks.fulfilled.type,
  //     payload: { tasks: startState["todolistId1"], todolistId: "todolistId1" }
  //   } as FetchTaskAction
  // );

  expect(endState["todolistId1"].length).toBe(3)
  expect(endState["todolistId2"].length).toBe(0)
})
