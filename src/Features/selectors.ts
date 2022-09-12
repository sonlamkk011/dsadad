import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../app/store";

// CONNECTION
export const isAdminSelector = (state: RootState) => state.connect.isAdmin;
export const accountInfoSelector = (state: RootState) => state.connect.accountInfo;