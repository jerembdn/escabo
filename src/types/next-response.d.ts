/* declare module "next/server" {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  interface NextResponse<T = any> extends OriginalNextResponse {
    json<U>(
      data: APIReponse<U>,
      init?: ResponseInit,
    ): NextResponse<APIReponse<U>>;
  }

  export function json<T>(
    data: APIReponse<T>,
    init?: ResponseInit,
  ): NextResponse<APIReponse<T>>;
}
 */
