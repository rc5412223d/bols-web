export class ChatRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    return new Response("ChatRoom OK");
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response("無垠伺服器登入與聊天服務正常運作");
    }

    if (url.pathname === "/chat") {
      if (!env.CHAT_ROOM) {
        return new Response("CHAT_ROOM 尚未設定", { status: 500 });
      }

      const id = env.CHAT_ROOM.idFromName("main");
      const room = env.CHAT_ROOM.get(id);

      return room.fetch(request);
    }

    return new Response("Not Found", { status: 404 });
  }
};
