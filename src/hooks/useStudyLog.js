import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

export function useStudyLog() {
  const [studyLog, setStudyLog] = useLocalStorage(
    "smartStudyTimer.studyLog",
    [],
  );

  const addRecord = useCallback(
    (date, subject, minutes) => {
      const newRecord = {
        id: Date.now(),
        date: date,
        subject: subject,
        minutes: minutes,
      };
      setStudyLog((current) => [...current, newRecord]);
    },
    [setStudyLog],
  );

  return { studyLog, addRecord };
}
