
const pathRegex = /[^/]\w+/;

export const parse = (object: ValidationData) => {

  const parsableErrors: ParsableError[] = [];

  object.errors.forEach((error) => {
    const pathField = pathRegex.exec(error.path)![0];
    parsableErrors.push({
      message: error.summary,
      field: pathField,
    })
  })

  return parsableErrors;
}

export interface ParsableError {
  message: string;
  field: string;
}

export interface ValidationError {
  summary: string;
  type: number;
  schema: {
    minLength: number;
    maxLength: number;
    type: string;
  },
  path: string;
  value: string;
  message: string;
  errors: unknown[];
}

export interface ValidationData {
  errors: ValidationError[];
}