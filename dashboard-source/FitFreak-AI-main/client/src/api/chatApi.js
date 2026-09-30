import api from "./axiosInstance";

function options(token, signal) {
  return {
    signal,
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  };
}

export async function getChat(token, signal) {
  const { data } = await api.get("/chat", options(token, signal));
  return data;
}

export async function sendChat(message, token, signal, history = []) {
  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  const { data } = await api.post(
    "/chat",
    {
      message,
      today,
      ...(!token ? { history: history.slice(-10).map(({ role, content }) => ({ role, content })) } : {}),
    },
    options(token, signal),
  );
  return data;
}

export async function clearChat(token, signal) {
  await api.delete("/chat", options(token, signal));
}
