const fogApiBase = process.env.NEXT_PUBLIC_FOG_API_BASE_URL;

if (!fogApiBase) {
  throw new Error("NEXT_PUBLIC_FOG_API_BASE_URL is not defined");
}

const defaultHeaders = {
  "Content-Type": "application/json",
  "fog-api-token": process.env.NEXT_PUBLIC_FOG_API_TOKEN || "",
  "fog-user-token": process.env.NEXT_PUBLIC_FOG_API_USER_KEY || "",
};

export async function fogFetch(path: string, options: RequestInit = {}) {
  const response = await fetch(`${fogApiBase}${path}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  });

  return response;
}
