import { createSlice } from "@reduxjs/toolkit";

interface CounterState {
  count: number;
}
const initialState: CounterState = {
  count: 0,
};

const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment: (state) => {
      state.count += 1;
    },
    decrease: (state) => {
      if (state.count > 0) {
        state.count-= 1;
      }else{
        state.count=0;
      }
    },
    reset:(state)=>{
        state.count=0;
    }
  },
});

export const { increment,decrease,reset} = counterSlice.actions;
export default counterSlice.reducer;
