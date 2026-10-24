import { useEffect, useState } from "react";
import { CalendarDays, ImageOff, Loader2, Megaphone } from "lucide-react";
import api, { apiMessage } from "../../api/axios";

// Published school news, read-only in every portal. The office writes it from
// the admin blog desk.
export default function BlogFeed({ title = "School Blog", subtitle }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/blog");
        setPosts(data);
      } catch (err) {
        setError(apiMessage(err, "Unable to load the blog."));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 dark:text-emerald-400">
          <Megaphone size={26} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {title}
          </h1>
          <p className="text-sm text-slate-500">
            {subtitle ?? "What has been happening at school."}
          </p>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:text-red-300"
        >
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 size={20} className="animate-spin" />
          Loading posts...
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-card p-10 text-center">
          <ImageOff size={28} className="mx-auto mb-3 text-slate-400" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">
            No posts yet
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            News the school publishes will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post._id}
              className="qd-rise overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-sm"
            >
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt=""
                  className="max-h-80 w-full bg-slate-100 object-cover dark:bg-slate-800"
                />
              )}

              <div className="space-y-3 p-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {post.title}
                </h2>

                <p className="flex items-center gap-2 text-xs text-slate-400">
                  <CalendarDays size={14} />
                  {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString(
                    undefined,
                    { day: "numeric", month: "long", year: "numeric" }
                  )}
                  {post.authorName && ` · ${post.authorName}`}
                </p>

                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {post.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
