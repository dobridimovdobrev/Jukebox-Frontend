import { useState, useRef, useCallback, useEffect } from "react";

const useSuccessMessage = (duration = 3000) => {
  const [message, setMessage] = useState("");
  const timerRef = useRef(null);

  const showSuccess = useCallback(
    (msg) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setMessage(msg);
      timerRef.current = setTimeout(() => setMessage(""), duration);
    },
    [duration]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return [message, showSuccess];
};

export default useSuccessMessage;
