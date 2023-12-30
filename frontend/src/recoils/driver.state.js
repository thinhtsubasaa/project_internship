import { atom, useRecoilState, useRecoilValue } from "recoil";
const getProfile = (key) => {
  try {
    if (typeof window !== "undefined") {
      const value = window.localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    }
    return null;
  } catch (error) {
    console.log(error);
  }
};

export const driverAtom = atom({
  key: "driver",
  default: getProfile("profile"),
});
export const useDriverState = () => useRecoilState(driverAtom);
export const useDriverValue = () => useRecoilValue(driverAtom);
