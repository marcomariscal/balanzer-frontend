import { combineReducers } from "redux";
import currentUser from "./currentUser";
import exchanges from "./exchanges";
import assets from "./assets";
import users from "./users";
import general from "./general";
import trades from "./trades";
import rebalance from "./rebalance";
import backtest from "./backtest";

export default combineReducers({
  currentUser,
  exchanges,
  users,
  general,
  assets,
  trades,
  rebalance,
  backtest,
});
