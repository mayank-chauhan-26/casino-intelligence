
"use client";

import { useCallback, useEffect, useState } from "react";

const API = (
  process.env.NEXT_PUBLIC_RADAR_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

type Website = {
  id: number;
  name: string;
  category: string;
  url: string;
};

type ScanItem = {
  website: string;
  url: string;
  status: string;
  error?: string | null;
};

type Scan = {
  job_id: number;
  status: string;
  total_sites: number;
  completed_sites: number;
  error?: string | null;
  items: ScanItem[];
};

type Change = {
  id: number;
  website: string;
  page_url: string;
  category: string;
  title: string;
  before_text: string;
  after_text: string;
  verification_status: string;
  detected_at: string;
};

export default function CasinoIntelRadar() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [changes, setChanges] = useState<Change[]>([]);
  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    const [sitesResponse, changesResponse] = await Promise.all([
      fetch(`${API}/api/websites`),
      fetch(`${API}/api/changes?limit=30`),
    ]);

    if (!sitesResponse.ok || !changesResponse.ok) {
      throw new Error("Could not load Radar data. Check that the backend is running.");
    }

    const sites = await sitesResponse.json();
    const latestChanges = await changesResponse.json();

    setWebsites(sites);
    setChanges(latestChanges);
  }, []);

  useEffect(() => {
    loadDashboard().catch((err) => setError(err.message));
  }, [loadDashboard]);

  const runCrawler = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/api/scans`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Unable to start the crawler.");
      }

      const result = await response.json();

      setScan({
        ...result,
        completed_sites: 0,
        items: [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!scan?.job_id) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const checkProgress = async () => {
      try {
        const response = await fetch(`${API}/api/scans/${scan.job_id}`);

        if (!response.ok) {
          throw new Error("Unable to retrieve scan progress.");
        }

        const result: Scan = await response.json();

        if (cancelled) return;

        setScan(result);

        const finished = [
          "completed",
          "completed_with_errors",
          "failed",
        ].includes(result.status);

        if (finished) {
          setLoading(false);
          const changesResponse = await fetch(`${API}/api/changes?limit=30`);
          if (changesResponse.ok) {
            setChanges(await changesResponse.json());
          }
          return;
        }

        timer = setTimeout(checkProgress, 2500);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Progress check failed.");
          setLoading(false);
        }
      }
    };

    checkProgress();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [scan?.job_id]);

  const statusLabel = (status: string) =>
    status.replaceAll("_", " ");

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
            Intelligence monitoring
          </p>
          <h2 className="mt-2 text-2xl font-bold">Casino Intel Radar</h2>
          <p className="mt-2 text-sm text-slate-400">
            Scan competitor websites and track changes across the market.
          </p>
        </div>

        <button
          onClick={runCrawler}
          disabled={loading || websites.length === 0}
          className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Scanning..." : "Run Crawler"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {websites.map((site) => {
          const item = scan?.items?.find(
            (entry) => entry.website === site.name
          );

          const status = item?.status || "not scanned";

          return (
            <div
              key={site.id}
              className="rounded-xl border border-white/10 bg-slate-900 p-4 text-white"
            >
              <p className="font-semibold">{site.name}</p>
              <p className="mt-1 text-xs text-slate-400">
                {site.category.replaceAll("_", " ")}
              </p>
              <p className="mt-4 text-xs capitalize text-cyan-300">
                {statusLabel(status)}
              </p>
              {item?.error && (
                <p className="mt-2 break-words text-xs text-red-300">
                  {item.error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {scan && (
        <div className="rounded-xl border border-white/10 bg-slate-900 p-5 text-white">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold">Latest scan</h3>
            <span className="text-sm capitalize text-cyan-300">
              {statusLabel(scan.status)}
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all"
              style={{
                width: `${
                  scan.total_sites
                    ? (scan.completed_sites / scan.total_sites) * 100
                    : 0
                }%`,
              }}
            />
          </div>

          <p className="mt-2 text-sm text-slate-400">
            {scan.completed_sites} of {scan.total_sites} websites processed
          </p>
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-slate-900 p-5 text-white">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Detected changes
            <p className="mt-1 text-sm text-slate-400">
              Website: {"website"}
            </p>
          </h3>
          <button
            onClick={() => loadDashboard().catch((err) => setError(err.message))}
            className="text-sm text-cyan-300 hover:text-cyan-200"
          >
            Refresh
          </button>
        </div>

        {changes.length === 0 ? (
          <p className="text-sm text-slate-400">
            No changes detected yet. Run your first scan to establish baseline
            snapshots. Changes will appear when a later scan differs.
          </p>
        ) : (
          <div className="space-y-4">
            {changes.map((change) => (
              <article
                key={change.id}
                className="rounded-lg border border-white/10 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-semibold">{change.title}</h4>
                  <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-300">
                    {change.verification_status}
                  </span>
                </div>

                <p className="mt-2 text-xs capitalize text-cyan-300">
                  {change.category.replaceAll("_", " ")}
                </p>

                <a
                  href={change.page_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block break-all text-xs text-slate-400 underline"
                >
                  {change.page_url}
                </a>

                <p className="mt-3 text-xs text-slate-500">
                  Detected: {new Date(change.detected_at).toLocaleString()}
                </p>

                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer text-cyan-300">
                    Compare previous and current content
                  </summary>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg bg-black/20 p-3">
                      <p className="mb-2 text-xs font-semibold text-slate-400">
                        PREVIOUS
                      </p>
                      <p className="max-h-48 overflow-auto whitespace-pre-wrap break-words text-xs text-slate-300">
                        {change.before_text}
                      </p>
                    </div>
                    <div className="rounded-lg bg-black/20 p-3">
                      <p className="mb-2 text-xs font-semibold text-slate-400">
                        CURRENT
                      </p>
                      <p className="max-h-48 overflow-auto whitespace-pre-wrap break-words text-xs text-slate-300">
                        {change.after_text}
                      </p>
                    </div>
                  </div>
                </details>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
