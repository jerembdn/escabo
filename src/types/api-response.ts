export type APIReponse<TData = null> = |
{
  success: true;
  data: TData;
} | {
  success: false;
  error: {
    message: string;
  };
}