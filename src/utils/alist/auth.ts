import { $Fetch } from "ofetch";
import { useRequest, Response } from "./utils";

export class Auth {
  private request: $Fetch;

  constructor() {
    this.request = useRequest();
  }

  public async login(username: string, password: string) {
    return await this.request<
      Response<{
        token: string;
      }>
    >("/auth/login", {
      method: "POST",
      body: { username, password },
    });
  }
}
