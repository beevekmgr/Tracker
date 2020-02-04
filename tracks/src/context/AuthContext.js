import { AsyncStorage } from "react-native";

import createDataContext from "./createDataContext";
import trackerApi from "../api/tracker";
import { navigate } from "../navigationRef.js";

const authReducer = (state, action) => {
  switch (action.type) {
    case "add_error":
      console.log(state);
      console.log(action.payload);
      return { ...state, errorMessage: action.payload };
    case "signin":
      return { token: action.payload, errorMessage: "" };
    case "clear_error_message":
      return { ...state, errorMessage: "" };
    case "signout":
      return { token: null, errorMessage: "" };
    default:
      return state;
  }
};

const clearErrorMessage = dispatch => () => {
  dispatch({ type: "clear_error_message" });
};

const signup = dispatch => async ({ email, password }) => {
  try {
    const response = await trackerApi.post("/signup", { email, password });

    await AsyncStorage.setItem("token", response.data.token);
    dispatch({ type: "signin", payload: response.data.token });
    navigate("TrackList");
  } catch (err) {
    dispatch({
      type: "add_error",
      payload: "Something went wrong with sign up"
    });
  }
};

const signin = dispatch => async ({ email, password }) => {
  try {
    const response = await trackerApi.post("/signin", { email, password });
    await AsyncStorage.setItem("token", response.data.token);
    dispatch({ type: "signin", payload: response.data.token });
    navigate("TrackList");
  } catch (err) {
    dispatch({
      type: "add_error",
      payload: "Something went wrong with sign in"
    });
  }
};

const signout = dispatch => async () => {
  await AsyncStorage.removeItem("token");
  dispatch({ type: "signout" });
  navigate("loginFlow");
};

const tryLocalSignin = dispatch => async () => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    dispatch({ type: "signin", payload: token });
    navigate("TrackList");
  } else {
    navigate("Signup");
  }
};

export const { Provider, Context } = createDataContext(
  authReducer,
  { signin, signup, signout, clearErrorMessage, tryLocalSignin },
  { token: null, errorMessage: "" }
);
