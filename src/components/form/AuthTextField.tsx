import { forwardRef } from 'react';

type AuthTextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  errorMessage?: string;
};

export const AuthTextField = forwardRef<HTMLInputElement, AuthTextFieldProps>(
  function AuthTextField({ errorMessage, ...inputProps }, ref) {
    const hasError = Boolean(errorMessage);

    return (
      <div>
        <input
          ref={ref}
          {...inputProps}
          className={`w-full bg-transparent border-b py-2 font-body text-sm focus:outline-none ${
            hasError ? 'border-stamp' : 'border-paper-line focus:border-ink'
          }`}
        />
        {hasError && <p className="mt-1 text-xs font-body text-stamp">{errorMessage}</p>}
      </div>
    );
  },
);