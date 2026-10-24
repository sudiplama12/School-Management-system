import { useEffect, useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  ImageOff,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import api, { apiMessage } from "../../api/axios";

// The school blog desk: write a post, attach a photo, publish or keep it as a
// draft. Only the office can post; every portal reads what is published.
export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/blog", { params: { drafts: 1 } });
      setPosts(data);
    } catch (err) {
      setError(apiMessage(err, "Unable to load the blog."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (post) => {
    if (!window.confirm(`Delete "${post.title}"? The photo goes with it.`)) return;

    try {
      await api.delete(`/blog/${post._id}`);
      setNotice("Post removed.");
      load();
    } catch (err) {
      setError(apiMessage(err, "The post could not be deleted."));
    }
  };

  const toggleStatus = async (post) => {
    try {
      await api.patch(`/blog/${post._id}`, {
        title: post.title,
        body: post.body,
        status: post.status === "published" ? "draft" : "published",
      });
      setNotice(
        post.status === "published"
          ? `"${post.title}" is a draft again.`
          : `"${post.title}" is live.`
      );
      load();
    } catch (err) {
      setError(apiMessage(err, "That change did not save."));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 dark:text-emerald-400">
            <Upload size={26} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              School Blog
            </h1>
            <p className="text-sm text-slate-500">
              Photos and news for every portal — published posts appear instantly.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setEditing({})}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <Plus size={17} />
          Write a post
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:text-red-300"
        >
          {error}
        </p>
      )}

      {notice && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          {notice}
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
            Nothing posted yet
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Write the first entry and it appears in every portal.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post._id}
              className="qd-rise overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-sm"
            >
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt=""
                  className="h-40 w-full bg-slate-100 object-cover dark:bg-slate-800"
                />
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
                  <ImageOff size={26} className="text-slate-400" />
                </div>
              )}

              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-bold text-slate-800 dark:text-slate-100">
                    {post.title}
                  </h2>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${
                      post.status === "published"
                        ? "bg-emerald-100 text-emerald-700 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {post.status}
                  </span>
                </div>

                <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
                  {post.body}
                </p>

                <p className="text-xs text-slate-400">
                  {post.authorName || "School office"} ·{" "}
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditing(post)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:text-slate-300"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleStatus(post)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:text-slate-300"
                  >
                    {post.status === "published" ? (
                      <>
                        <EyeOff size={14} /> Unpublish
                      </>
                    ) : (
                      <>
                        <Eye size={14} /> Publish
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => remove(post)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing !== null && (
        <PostComposer
          post={editing}
          onClose={() => setEditing(null)}
          onSaved={(text) => {
            setEditing(null);
            setNotice(text);
            load();
          }}
        />
      )}
    </div>
  );
}

function PostComposer({ post, onClose, onSaved }) {
  const isNew = !post._id;
  const fileInput = useRef(null);

  const [title, setTitle] = useState(post.title ?? "");
  const [body, setBody] = useState(post.body ?? "");
  const [status, setStatus] = useState(post.status ?? "published");
  const [file, setFile] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const preview = file ? URL.createObjectURL(file) : post.imageUrl || "";

  const submit = async () => {
    setSaving(true);
    setError("");

    const form = new FormData();
    form.append("title", title);
    form.append("body", body);
    form.append("status", status);

    if (file) form.append("photo", file);
    if (removePhoto) form.append("removePhoto", "1");

    try {
      const { data } = isNew
        ? await api.post("/blog", form)
        : await api.patch(`/blog/${post._id}`, form);

      onSaved(isNew ? `"${data.title}" is saved.` : `"${data.title}" is updated.`);
    } catch (err) {
      setError(apiMessage(err, "The post could not be saved."));
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="qd-pop w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {isNew ? "Write a post" : "Edit post"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:text-red-300"
            >
              {error}
            </p>
          )}

          <div>
            <label
              htmlFor="blog-title"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Title
            </label>
            <input
              id="blog-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Annual sports week begins"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="blog-body"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              What happened
            </label>
            <textarea
              id="blog-body"
              rows={7}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Write it the way you would tell parents."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Photo
            </span>

            {preview && !removePhoto && (
              <img
                src={preview}
                alt=""
                className="mb-3 max-h-44 w-full rounded-xl border border-slate-200 object-cover"
              />
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:text-slate-300"
              >
                <Upload size={16} />
                {file ? file.name : preview ? "Change photo" : "Choose a photo"}
              </button>
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null);
                  setRemovePhoto(false);
                }}
              />

              {preview && (
                <label className="inline-flex items-center gap-2 text-sm text-slate-500">
                  <input
                    type="checkbox"
                    checked={removePhoto}
                    onChange={(event) => setRemovePhoto(event.target.checked)}
                    className="rounded border-slate-300"
                  />
                  Remove photo
                </label>
              )}
            </div>

            <p className="mt-2 text-xs text-slate-400">
              JPG, PNG or WebP, up to 3 MB.
            </p>
          </div>

          <div>
            <label
              htmlFor="blog-status"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Visibility
            </label>
            <select
              id="blog-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="published">Published — everyone sees it</option>
              <option value="draft">Draft — only this screen</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving || !title.trim() || !body.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {isNew ? "Post it" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
