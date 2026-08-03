const API_BASE_PATH = '/api';

export class ApiError extends Error {
  status: number;
  code: string;
  fieldErrors?: Record<string, string[] | undefined>;

  constructor({
    status,
    code,
    fieldErrors,
  }: {
    status: number;
    code: string;
    fieldErrors?: Record<string, string[] | undefined>;
  }) {
    super(code);
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

async function parseJsonSafely(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) return null;

  return JSON.parse(text);
}

export async function apiFetch<TResponse>({
  path,
  method = 'GET',
  body,
}: {
  path: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
}): Promise<TResponse> {
  const isFormData = body instanceof FormData;

  const response = await fetch(`${API_BASE_PATH}${path}`, {
    method,
    credentials: 'include',
    headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await parseJsonSafely(response);

  const hasFailed = !response.ok;

  if (hasFailed) {
    const parsedData = data as { error?: string; issues?: Record<string, string[]> };
    const code = typeof parsedData?.error === 'string' ? parsedData.error : 'unknown_error';

    throw new ApiError({ status: response.status, code, fieldErrors: parsedData?.issues });
  }

  return data as TResponse;
}