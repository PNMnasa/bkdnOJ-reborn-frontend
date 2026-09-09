import { useNavigate } from "react-router";
import type { ComponentType } from "react";

export const isEmpty = (obj: Record<string, unknown>) => {
  return Object.keys(obj).length === 0;
};

export function getPollDelay(): number {
  return Number(process.env.REACT_APP_POLL_DELAY) || 5000;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function randomString(length = 16): string {
  let result = "";
  const charactersLength = ALPHABET.length;
  for (let i = 0; i < length; i++) {
    result += ALPHABET.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length;
  let temporaryValue: T;
  let randomIndex: number;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export const wrapNavigate = <P extends object>(Component: ComponentType<P & { navigate: ReturnType<typeof useNavigate> }>) => {
  const Wrapper = (props: P) => {
    const navigate = useNavigate();

    return <Component navigate={navigate} {...props} />;
  };

  return Wrapper;
};