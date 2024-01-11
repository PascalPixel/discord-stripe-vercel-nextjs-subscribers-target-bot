export const getURL = () => {
  const fallback = "http://localhost:8888/";
  let url =
    // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_SITE_URL ??
    // Automatically set by Vercel.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ??
    fallback;
  // Make sure to include `https://` when not localhost.
  url = url.includes("http") ? url : `https://${url}`;
  // Make sure to including trailing `/`.
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
  // Make sure it isn't empty
  if (url === "https://") url = fallback;
  return url;
};
