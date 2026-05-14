import { useContext, useState, ChangeEvent, SubmitEvent } from 'react';
import { AuthContext } from '../contexts/AuthContext.tsx';
import type { RegisterForm } from '@/types/index.ts';

const RegisterForm = () => {
  const [formState, setFormState] = useState<RegisterForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { register } = useContext(AuthContext)!;

  const handleInput = (e: ChangeEvent<HTMLInputElement>) =>
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formState.confirmPassword !== formState.password) return;
    register(formState);
  };

  return (
    <form onSubmit={handleSubmit}>
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        <legend className="fieldset-legend">Sign Up</legend>

        <label className="fieldset-label" htmlFor="firstName">
          First name
        </label>
        <input
          className="input"
          type="text"
          required
          placeholder="John"
          name="firstName"
          onChange={handleInput}
          value={formState.firstName}
          id="firstName"
        />
        <label className="fieldset-label" htmlFor="lastName">
          Last Name
        </label>
        <input
          className="input"
          type="text"
          required
          placeholder="Malkovich"
          name="lastName"
          onChange={handleInput}
          value={formState.lastName}
          id="lastName"
        />

        <label className="fieldset-label" htmlFor="email-signup">
          Email
        </label>
        <input
          className="input validator"
          type="email"
          required
          placeholder="mail@site.com"
          name="email"
          onChange={handleInput}
          value={formState.email}
          id="email-signup"
        />
        <div className="validator-hint hidden">Enter valid email address</div>

        <label className="fieldset-label" htmlFor="password-signup">
          Password
        </label>
        <input
          type="password"
          className="input validator"
          required
          placeholder="Password"
          minLength={8}
          name="password"
          pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\#\?!\@\$%^&*\-]).{8,}"
          title="Must be more than 8 characters, including number, lowercase letter, uppercase letter and a special character (#?!@$ %^&*-))"
          onChange={handleInput}
          value={formState.password}
          id="password-signup"
        />
        <p className="validator-hint hidden">
          Must be more than 8 characters, including
          <br />
          At least one number
          <br />
          At least one lowercase letter
          <br />
          At least one uppercase letter
          <br />
          At least one special character (#?!@$ %^&*-)
        </p>

        <label className="fieldset-label" htmlFor="password-confirm">
          Confirm Password
        </label>
        <input
          type="password"
          className={`input ${formState.password === formState.confirmPassword ? 'confirm-valid' : 'confirm-invalid'}`}
          required
          placeholder="Confirm Password"
          title="Must match Password"
          name="confirmPassword"
          onChange={handleInput}
          value={formState.confirmPassword}
          id="password-confirm"
        />
        {formState.confirmPassword &&
          formState.confirmPassword !== formState.password && (
            <p className="validator-hint hidden">Passwords don&apos;t match.</p>
          )}

        <button
          disabled={
            !formState.confirmPassword ||
            formState.confirmPassword !== formState.password
          }
          className="btn btn-neutral mt-4"
        >
          Signup
        </button>
      </fieldset>
    </form>
  );
};

export default RegisterForm;
