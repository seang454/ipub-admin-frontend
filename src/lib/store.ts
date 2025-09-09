import { configureStore } from "@reduxjs/toolkit";
export const store = configureStore({
  reducer: {
    // your reducers here
    counter: (state = { value: 0 }, action) => {
      switch (action.type) {
        case "increment":
          return { value: state.value + 1 };
        case "decrement":
          return { value: state.value - 1 };
        default:
          return state;
      }
    },
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
