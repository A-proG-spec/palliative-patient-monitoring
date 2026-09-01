export interface ApiResponseData<T = any> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export class ApiResponse<T = any> {
  public statusCode: number;
  public success: boolean;
  public message: string;
  public data: T;

  constructor(statusCode: number, message: string = 'OK', data: T) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }

  public toJSON(): ApiResponseData<T> {
    return {
      statusCode: this.statusCode,
      success: this.success,
      message: this.message,
      data: this.data,
    };
  }
}

export const SuccessResponse = <T = any>(
  statusCode: number = 200,
  message: string = 'OK',
  data: T
): ApiResponseData<T> => {
  return new ApiResponse(statusCode, message, data).toJSON();
};

export default ApiResponse;