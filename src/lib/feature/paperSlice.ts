import { createSlice } from "@reduxjs/toolkit";
import { studentSlice } from "./studentSlice";

type CounterState = {
  count: number;
};

const initialState: CounterState = {
  count: 0,
};

export const paperSlice = createSlice({
  name: "paper",
  initialState,
  reducers: {
    increment: (state) => {
      state.count += 1;
    },
    decrease: (state) => {
      if (state.count > 0) {
        state.count -= 1;
      } else {
        state.count = 0;
      }
    },
    first: (state) => {
      state.count = 0;
    },
    last: (state) => {
      state.count = 100;
    },
    reset: (state) => {
      state.count = 0;
    },
  },
});

export const { increment, decrease, first, last, reset } = paperSlice.actions;
export default paperSlice.reducer;
