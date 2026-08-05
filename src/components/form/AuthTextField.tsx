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
          className={`w-full bg-panel-raised border rounded-xl px-3.5 py-2.5 font-body text-sm text-primary placeholder:text-secondary focus:outline-none focus:ring-1 ${
            hasError ? 'border-negative focus:ring-negative' : 'border-subtle focus:ring-mint focus:border-mint'
          }`}
        />
        {hasError && <p className="mt-1 text-xs font-body text-negative">{errorMessage}</p>}
      </div>
    );
  },
);