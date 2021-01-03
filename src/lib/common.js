// import mock_rest from './mock/rest'

const store = (storage) => ({
  set: (key, value) => {
    if (value === null || value === undefined) {
      storage.removeItem(key);
    } else {
      storage.setItem(key, JSON.stringify(value));
    }
  },
  get: (key) => {
    const value = storage.getItem(key);
    if (value === null) {
      return null;
    } else {
      return JSON.parse(value);
    }
  },
  remove: (key) => {
    storage.removeItem(key);
  },
  clear: () => {
    storage.clear();
  },
});

export const session = {
  ...store(sessionStorage),
  getId: () => {
    const cookie = document.cookie
      ? document.cookie
          .split("; ")
          .find((item) => item.trim().startsWith("LZXSID="))
      : null;
    return cookie ? cookie.trim().split("=")[1] : null;
  },
};

export const cache = store(localStorage);

export const rest = {
  get: async (url) => {
    // if (process.env.NODE_ENV === "development") return await mock_rest.get(url);
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      alert(error);
    }
  },
  post: async (url, data) => {
    // if (process.env.NODE_ENV === "development") return await mock_rest.post(url);
    try {
      const response = await fetch(
        url,
        data instanceof FormData
          ? {
              method: "POST",
              body: data,
            }
          : {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            }
      );
      return await response.json();
    } catch (error) {
      alert(error);
    }
  },
  put: async (url, data) => {
    // if (process.env.NODE_ENV === "development") return await mock_rest.put(url);
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      alert(error);
    }
  },
  patch: async (url, data) => {
    // if (process.env.NODE_ENV === "development") return await mock_rest.patch(url);
    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      alert(error);
    }
  },
  delete: async (url) => {
    // if (process.env.NODE_ENV === "development") return await mock_rest.delete(url);
    try {
      const response = await fetch(url, {
        method: "DELETE",
      });
      return await response.json();
    } catch (error) {
      alert(error);
    }
  },
};

export const validateLoginSession = () => {
  // guest user
  if (!cache.get("uid")) {
    return false;
  }

  const sessionId = session.getId();
  if (!sessionId) {
    return false;
  }

  // server rotated session id
  if (sessionId !== cache.get("sessionID")) {
    rest.get("/api/authentication/" + sessionId).then((data) => {
      if (validateResponse(data)) {
        if (data.sessionID) {
          cache.set("sessionID", data.sessionID);
          cache.set("uid", data.uid);
          cache.set("username", data.username);
          cache.set("role", data.role);
          if (typeof window.app.setLoggedIn === "function") {
            window.app.setLoggedIn(Boolean(data.uid));
          }
        }
      }
    });
  }

  return cache.get("uid") > 0;
};

export const validateResponse = (data) => {
  if (!data) {
    alert("服务器没有响应");
    return false;
  } else {
    if ("error" in data) {
      alert(data.error);
      return false;
    }
  }
  return true;
};

const date = new Intl.DateTimeFormat("en-US", {
  month: "numeric",
  day: "numeric",
});

const yearDate = new Intl.DateTimeFormat("en-US", {
  year: "2-digit",
  month: "numeric",
  day: "numeric",
});

const time = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const dateTime = new Intl.DateTimeFormat("en-US", {
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const yearDateTime = new Intl.DateTimeFormat("en-US", {
  year: "2-digit",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export const toTime = (ts_seconds) => {
  return time.format(new Date(ts_seconds * 1000));
};

export const toDate = (ts_seconds) => {
  return date.format(new Date(ts_seconds * 1000));
};

export const toYearDate = (ts_seconds) => {
  return yearDate.format(new Date(ts_seconds * 1000));
};

export const toDateTime = (ts_seconds) => {
  return dateTime.format(new Date(ts_seconds * 1000));
};

export const toYearDateTime = (ts_seconds) => {
  return yearDateTime.format(new Date(ts_seconds * 1000));
};

export const toAutoTime = (ts_seconds) => {
  let dt = new Date(ts_seconds * 1000);
  let now = new Date();
  if (now.getFullYear() === dt.getFullYear()) {
    if (now.getMonth() === dt.getMonth() && now.getDate() === dt.getDate()) {
      return time.format(dt);
    } else {
      return dateTime.format(dt);
    }
  } else {
    return yearDateTime.format(dt);
  }
};

export const toAutoTimeOrDate = (ts_seconds) => {
  let dt = new Date(ts_seconds * 1000);
  let now = new Date();
  if (now.getFullYear() === dt.getFullYear()) {
    if (now.getMonth() === dt.getMonth() && now.getDate() === dt.getDate()) {
      return time.format(dt);
    } else {
      return date.format(dt);
    }
  } else {
    return yearDate.format(dt);
  }
};

export const scrollTo = (top) => {
  window.scrollTo({
    top,
    left: 0,
    behavior: "smooth",
  });
};

export const randomId = () => Math.random().toString(36).substring(2);

const entities = {
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&amp;": "&",
};
const re = /&(?:lt|gt|quot|apos|amp);/g;

// PHP htmlspecialchars_decode()
export const decodeHtmlSpecialChars = (text) =>
  text.replace(re, (m) => entities[m]);

const reUrl = /(?<=^|[^"'>;\w])https?:\/\/([\w-]+\.)+\w+(:\d+)?[\w-/?=&#%,.]*(?<![,.])/gi;
export const linkify = (text) =>
  text.replace(reUrl, (m) => `<a rel="nofollow" target="_blank" href="${m}">${m}</a>`);
