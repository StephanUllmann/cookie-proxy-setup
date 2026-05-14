export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginForm {
  email: string;
  password: string;
}
