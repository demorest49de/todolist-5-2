import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, AppRootStateType } from "../app/store";

//  тип конфигурации апи санки
export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: AppRootStateType,
  dispatch: AppDispatch,
  rejectValue: null
}>();