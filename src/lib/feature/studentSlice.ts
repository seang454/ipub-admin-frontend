import { createSlice } from "@reduxjs/toolkit";

type CounterState = {
  count: number;
};

const initialState: CounterState = {
  count: 0,
};

export const studentSlice = createSlice({
  name: "student",
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

export const { increment, decrease, first, last, reset } = studentSlice.actions;
export default studentSlice.reducer;
