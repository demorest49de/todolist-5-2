import {
  ArgsDeleteTask,
  ArgsUpdateTask,
  TaskPriorities,
  TaskStatuses,
  TaskType,
  todolistsAPI,
  UpdateTaskModelType,
} from "api/todolists-api"
import { handleServerAppError, handleServerNetworkError } from "utils/error-utils"
import { appActions } from "app/app.reducer"
import { todolistsActions } from "features/TodolistsList/todolists.reducer"
import { createSlice } from "@reduxjs/toolkit"
import { clearTasksAndTodolists } from "common/actions/common.actions"
import { createAppAsyncThunk } from "../../utils/createAppAsyncThunk"

const initialState: TasksStateType = {}

enum ResultCodeAsEnum {
  success = 0,
  error = 1,
  captcha = 10,
}

/**
 * const directions = ["up", "down", "left", "right"] as const;
 *
 * // Тип directions теперь равен readonly ["up", "down", "left", "right"]
 * type Direction = (typeof directions)[number];
 *
 * // Тип Direction равен "up" | "down" | "left" | "right"
 * let move: Direction;
 * move = "up"; // Правильно
 * move = "down"; // Правильно
 * move = "forward"; // Ошибка: Тип '"forward"' не может быть присвоен типу 'Direction'.
 *
 */

/**
 *
 * const direction = {
 *   Up: "UP",
 *   Down: "DOWN",
 *   Left: "LEFT",
 *   Right: "RIGHT",
 * } as const
 *
 * // Типизация
 * type a1 = typeof direction
 * type a2 = keyof typeof direction
 *
 * type Direction2 = a1[a2]
 * type Direction = (typeof direction)[keyof typeof direction]
 *
 * function foo(a: Direction) {
 *   // code
 * }
 *
 * foo(direction.Up) // ✅ Так все хорошо отработает
 * foo("UP") // ✅ И так все хорошо отработает 👍
 *
 */

/**
 * readonly свва в объекте ResultCode2
 */
const ResultCodeAsObject = {
  success: 0,
  error: 1,
  captcha: 10,
} as const

const slice = createSlice({
  name: "tasks",
  initialState,

  //region reducers
  /**
   * todo общий редюсер для экш/редюсеров но! не для санок! для санок - экстраредюсеры!!!!
   */
  reducers: {},
  //endregion reducers

  //region extrareducers
  /**
   * todo extra reducer нужен: 1) с санками работает только экстраредюсер; 2) вызвать вызвать редюсер из другого слайса
   */
  extraReducers: (builder) => {
    builder
      .addCase(removeTask.fulfilled, (state, action) => {
        const tasks = state[action.payload.todolistId]
        const index = tasks.findIndex((t) => t.id === action.payload.taskId)
        if (index !== -1) tasks.splice(index, 1)
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const tasks = state[action.payload.todolistId]
        const index = tasks.findIndex((t) => t.id === action.payload.taskId)
        if (index !== -1) {
          tasks[index] = { ...tasks[index], ...action.payload.domainModel }
        }
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state[action.payload.todolistId] = action.payload.tasks
      })
      .addCase(addTask.fulfilled, (state, action) => {
        const tasks = state[action.payload.task.todoListId]
        tasks.unshift(action.payload.task)
      })
      .addCase(todolistsActions.addTodolist, (state, action) => {
        state[action.payload.todolist.id] = []
      })
      .addCase(todolistsActions.removeTodolist, (state, action) => {
        delete state[action.payload.id]
      })
      .addCase(todolistsActions.setTodolists, (state, action) => {
        action.payload.todolists.forEach((tl) => {
          state[tl.id] = []
        })
      })
      .addCase(clearTasksAndTodolists, () => {
        return {}
      })
  },
  //endregion extrareducers
})

// thunks

// region fetchTasks
type returnedTypeForFetchTasks = {
  tasks: TaskType[]
  todolistId: string
}

/**
 * экшн криэйтор теперь не создаем он создается сам
 *  возвращаемый тип из санки
 *    аргументы из санки
 */
const fetchTasks = createAppAsyncThunk<
  returnedTypeForFetchTasks, //todo  возвращаемый тип из санки
  { todolistId: string } // todo аргументы из санки
>(
  `${slice.name}/fetchTasks`, // todo если навести на асинк то увидим что 2 аргумент т ес  коллбэк возвращает промис
  async ({ todolistId }, thunkAPI) => {
    const { dispatch, rejectWithValue, getState } = thunkAPI

    try {
      const res = await todolistsAPI.getTasks(todolistId)
      dispatch(appActions.setAppStatus({ status: "loading" }))
      const tasks = res.data.items
      dispatch(appActions.setAppStatus({ status: "succeeded" }))
      return { tasks, todolistId }
    } catch (error) {
      handleServerNetworkError(error, dispatch)
      return rejectWithValue(null) // todo заглушка
    }
  },
)

//#endregion fetchTasks

// region addTask
const addTask = createAppAsyncThunk<{ task: TaskType }, { todolistId: string; title: string }>(
  `${slice.name}/addTask`,
  async (args, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI

    dispatch(appActions.setAppStatus({ status: "loading" }))
    try {
      const res = await todolistsAPI.createTask(args)

      if (res.data.resultCode === ResultCodeAsEnum.success) {
        const task = res.data.data.item
        dispatch(appActions.setAppStatus({ status: "succeeded" }))
        return { task }
      } else {
        handleServerAppError(res.data, dispatch)
        return rejectWithValue(null)
        // заглушка
      }
    } catch (error) {
      handleServerNetworkError(error, dispatch)
      return rejectWithValue(null)
      // заглушка
    }
  },
)
// endregion addTask

// region updateTask
const updateTask = createAppAsyncThunk<ArgsUpdateTask, ArgsUpdateTask>(
  `${slice.name}/updateTask`,
  async (args, thunkAPI) => {
    const { dispatch, getState, rejectWithValue } = thunkAPI
    const { taskId, domainModel, todolistId } = args
    const state = getState()
    const task = state.tasks[todolistId].find((t) => t.id === taskId)

    if (!task) {
      //throw new Error("task not found in the state");
      console.warn("task not found in the state")
      return rejectWithValue(null)
    }

    const apiModel: UpdateTaskModelType = {
      deadline: task.deadline,
      description: task.description,
      priority: task.priority,
      startDate: task.startDate,
      title: task.title,
      status: task.status,
      ...domainModel,
    }

    debugger
    try {
      const res = await todolistsAPI.updateTask(todolistId, taskId, apiModel)
      if (res.data.resultCode === 0) {
        return args
      } else {
        handleServerAppError(res.data, dispatch)
        return rejectWithValue(null)
      }
    } catch (error) {
      handleServerNetworkError(error, dispatch)
      return rejectWithValue(null)
    }
  },
)
// endregion updateTask

// region removeTask
const removeTask = createAppAsyncThunk<ArgsDeleteTask, ArgsDeleteTask>(
  `${slice.name}/removeTask`,
  async (args, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI
    try {
      await todolistsAPI.deleteTask(args.todolistId, args.taskId)
      return args
    } catch (error) {
      handleServerNetworkError(error, dispatch)
      return rejectWithValue(null)
    }
  },
)
// endregion fetchTasks

//region types
export type UpdateDomainTaskModelType = {
  title?: string
  description?: string
  status?: TaskStatuses
  priority?: TaskPriorities
  startDate?: string
  deadline?: string
}
export type TasksStateType = {
  [key: string]: Array<TaskType>
}
//endregion types

export const tasksReducer = slice.reducer
export const tasksActions = slice.actions
export const tasksThunks = { fetchTasks, addTask, updateTask, removeTask }
