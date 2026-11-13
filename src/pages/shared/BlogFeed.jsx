import { useEffect, useState } from "react";
import { CalendarDays, ImageOff, Loader2, Megaphone } from "lucide-react";
import api, { apiMessage } from "../../api/axios";
import { Tear } from "../../components/Motion";
import { Pin } from "../../components/Paper";
import { sheetProps } from "../../utils/paper";

// Published school news, read-only in every portal. The office writes it from
// the admin blog desk.
//
// Each post is a sheet pinned to the board, so the reader's eye can find the
// corner of one article and the start of the next without a card border doing
// it. `fold` is not decoration here: a stack of identical rounded rectangles is
// a UI list, and a stack of sheets with one corner turned up is a notice board.
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
          <h1 className="text-2xl font-bold text-slate-800">
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
        <div className="qd-board p-5 sm:p-8">
          <div
            {...sheetProps(0, {
              fold: true,
              className: "px-6 py-10 text-center",
            })}
          >
            <ImageOff size={28} className="mx-auto mb-3 text-[color:var(--qd-sheet-muted)]" />
            <h3 className="font-semibold">No posts yet</h3>
            <p className="mt-1 text-sm text-[color:var(--qd-sheet-muted)]">
              News the school publishes will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="qd-board space-y-7 p-5 pt-7 sm:p-8 sm:pt-9">
          {posts.map((post, index) => (
            <Tear
              as="article"
              key={post._id}
              index={index}
              {...sheetProps(index, { fold: true })}
            >
              <Pin />

              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt=""
                  className="mt-2 aspect-[16/9] w-full rounded-sm bg-slate-100 object-cover shadow-inner"
                />
              )}

              <div className="space-y-3 px-5 py-5 sm:px-7">
                <h2 className="text-xl font-bold">
                  {post.title}
                </h2>

                <p className="flex items-center gap-2 text-xs text-[color:var(--qd-sheet-muted)]">
                  <CalendarDays size={14} />
                  {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString(
                    undefined,
                    { day: "numeric", month: "long", year: "numeric" }
                  )}
                  {post.authorName && ` · ${post.authorName}`}
                </p>

                <p className="whitespace-pre-line text-sm leading-relaxed">
                  {post.body}
                </p>
              </div>
            </Tear>
          ))}
        </div>
      )}
    </div>
  );
}
