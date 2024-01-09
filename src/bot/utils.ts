import { Context } from "telegraf";
import { Message, Update } from "telegraf/typings/core/types/typegram";

export interface CommandContext
  extends Context<{
    message: Update.New & Update.NonChannel & Message.TextMessage;
    update_id: number;
  }> {}

export interface CallbackMessage {
  (message: string, status?: string): void;
}

export class MakeTask {
  private callback: CallbackMessage;

  constructor(callback: CallbackMessage) {
    this.callback = callback;
  }

  public async process<T>(
    method: (() => Promise<T>) | T,
    success: string,
    error: string,
    status?: string
  ): Promise<T> {
    let result: T;

    if (typeof method === "function") {
      result = await (method as () => Promise<T>)();
    } else {
      result = method as T;
    }

    if (result) {
      this.callback(success, status);
      return result;
    } else {
      this.callback(error, "发生错误");
      return result;
    }
  }
}
