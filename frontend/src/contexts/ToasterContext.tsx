import { useEffect, useRef, useState, createContext, ReactNode } from 'react';

const colors = {
  success: 'hsl(120, 61%, 50%)',
  error: 'hsl(0, 100%, 50%)',
  neutral: 'hsl(208, 37%, 45%)',
};

type ToastState = 'success' | 'error' | 'neutral';

interface ToastMessage {
  msg: string;
  id: string;
  state: ToastState;
}

interface Toaster {
  toast: (msg: string) => void;
  success: (msg: string) => void;
  error: (msg: string) => void;
}

interface ToastStyles {
  position: string;
}

interface ToasterContextType {
  toaster: Toaster;
}

export const ToasterContext = createContext<ToasterContextType | undefined>(
  undefined
);

interface ToasterProviderProps {
  children: ReactNode;
  styles?: ToastStyles;
}

const ToasterProvider = ({
  children,
  styles = { position: 'top-left' },
}: ToasterProviderProps) => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const deleteToast = (msgId: string) =>
    setMessages((prev) => prev.filter((m) => m.id !== msgId));

  const toaster = useRef<Toaster>({
    toast: (msg: string) =>
      setMessages((prev) => [
        ...prev,
        { msg, id: crypto.randomUUID(), state: 'neutral' },
      ]),
    success: (msg: string) =>
      setMessages((prev) => [
        ...prev,
        { msg, id: crypto.randomUUID(), state: 'success' },
      ]),
    error: (msg: string) =>
      setMessages((prev) => [
        ...prev,
        { msg, id: crypto.randomUUID(), state: 'error' },
      ]),
  });

  return (
    <ToasterContext value={{ toaster: toaster.current }}>
      <ToastContainer styles={styles}>
        {messages.length >= 0 &&
          messages.map((msg, i) => (
            <Toast
              key={msg.id}
              message={msg}
              ind={i}
              deleteToast={deleteToast}
              styles={styles}
            />
          ))}
      </ToastContainer>
      {children}
    </ToasterContext>
  );
};

export default ToasterProvider;

interface ToastProps {
  message: ToastMessage;
  ind: number;
  deleteToast: (id: string) => void;
  styles: ToastStyles;
  duration?: number;
}

const Toast = ({
  message,
  ind,
  deleteToast,
  styles,
  duration = 3000,
}: ToastProps) => {
  const { position } = styles;
  const isBottom = position?.includes('bottom');
  const [width, setWidth] = useState(100);
  const [toggle, setToggle] = useState(false);
  const [delay, setDelay] = useState(100 * ind + 700);

  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined
  );

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (delay > 0) {
        setDelay((d) => d - 100);
        return;
      }

      setWidth((w) => {
        if (w <= 0) {
          clearInterval(intervalRef.current);
          return 0;
        } else {
          return w - 10000 / duration;
        }
      });
    }, 100);

    return () => clearInterval(intervalRef.current);
  }, [toggle, duration, delay]);

  useEffect(() => {
    if (width > 0) return;

    const timeoutId = setTimeout(() => {
      deleteToast(message.id);
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [width, deleteToast, message.id]);

  return (
    <div
      className={`toast ${isBottom ? 'enter-bottom' : ''} ${width !== 0 ? '' : isBottom ? 'leave-bottom' : 'leave'}`}
      style={{ animationDelay: `${ind * 100}ms` }}
      onMouseEnter={() => clearInterval(intervalRef.current)}
      onMouseLeave={() => setToggle((t) => !t)}
      onClick={() => {
        clearInterval(intervalRef.current);
        setWidth(0);
      }}
    >
      <p>{message.msg}</p>
      <div
        className="toast-bar"
        style={{ width: width + '%', backgroundColor: colors[message.state] }}
      ></div>
    </div>
  );
};

interface ToastContainerProps {
  children: ReactNode;
  styles: ToastStyles;
}

const ToastContainer = ({ children, styles }: ToastContainerProps) => {
  const { position } = styles;
  return (
    <div
      className={`toaster ${(children as ReactNode[]).length ? 'toast-container' : ''} ${position}`}
    >
      {children}
    </div>
  );
};
