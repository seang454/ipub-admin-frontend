import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // import the correct storage engine
import persistStore from "redux-persist/es/persistStore";
import { paperApi } from "./api/paperSlice";
import { userApi } from "./api/userSlice";

const persistConfig = {
  key: "root",
  storage, // use the imported storage
  // whitelist: [""], // only auth will be persisted //name of reducer
}

const rootReducer = combineReducers({
   [paperApi.reducerPath]:paperApi.reducer,
   [userApi.reducerPath]:userApi.reducer,
})
const persistedReducer = persistReducer(persistConfig, rootReducer); // wrap the root reducer with persistReducer and use for store to persist the store and store the data in local storage
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE","persist/PAUSE","persist/PURGE","persist/FLUSH","persist/REGISTER"],  //disable the serializable check for these actions in redux persist
      },
    }).concat(paperApi.middleware,userApi.middleware), // add the api middleware to the store
});

export const persistor=persistStore(store); // create a persistor for the store
export type AppStore = typeof store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
