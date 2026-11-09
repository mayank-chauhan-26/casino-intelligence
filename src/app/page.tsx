
"use client";

import { useMemo, useState } from "react";
import CasinoIntelRadar from "./components/CasinoIntelRadar";

const casinos = [
  {
    id: 1,
    name: "Northstar Play",
    slug: "northstar-play",
    initials: "N",
    color: "#244c48",
    category: "Slots",
    score: "9.4",
    confidence: "High",
    description: "A fictional casino profile used to demonstrate our research and review system.",
    tags: ["Slots", "Mobile", "Demo"],
  },
  {
    id: 2,
    name: "Velvet Spin",
    slug: "velvet-spin",
    initials: "V",
    color: "#59405d",
    category: "Live Casino",
    score: "8.9",
    confidence: "Medium",
    description: "An illustrative live casino profile with a sample provider and payments overview.",
    tags: ["Live Casino", "Demo"],
  },
  {
    id: 3,
    name: "Orbit Casino",
    slug: "orbit-casino",
    initials: "O",
    color: "#354a70",
    category: "Crypto",
    score: "8.7",
    confidence: "Medium",
    description: "A fictional international casino profile for demonstrating country-specific research.",
    tags: ["Crypto", "Slots", "Demo"],
  },
  {
    id: 4,
    name: "Golden Harbor",
    slug: "golden-harbor",
    initials: "G",
    color: "#705735",
    category: "Slots",
    score: "8.5",
    confidence: "Low",
    description: "A sample operator profile demonstrating incomplete evidence and confidence tracking.",
    tags: ["Slots", "Demo"],
  },
  {
    id: 5,
    name: "Nova Reel",
    slug: "nova-reel",
    initials: "N",
    color: "#41466c",
    category: "Live Casino",
    score: "8.3",
    confidence: "Medium",
    description: "An illustrative casino entry for exploring games, software and editorial research.",
    tags: ["Live Casino", "Mobile", "Demo"],
  },
  {
    id: 6,
    name: "Atlas Gaming",
    slug: "atlas-gaming",
    initials: "A",
    color: "#47564a",
    category: "Crypto",
    score: "8.1",
    confidence: "Low",
    description: "A fictional casino profile for testing the comparison interface.",
    tags: ["Crypto", "Demo"],
  },
];

const filters = [
  "All casinos",
  "Slots",
  "Live Casino",
  "Crypto",
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" width="19" height="19">
      <circle cx="11" cy="11" r="7" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" width="16" height="16">
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

function CasinoCard({
  casino,
  selected,
  onSelect,
}: {
  casino: (typeof casinos)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <article className="casino-card">
      <div className="casino-card-top">
        <div className="casino-identity">
          <div
            className="casino-logo"
            style={{ background: casino.color }}
          >
            {casino.initials}
          </div>
          <div>
            <h3>{casino.name}</h3>
            <span className="demo-label">DEMO PROFILE</span>
          </div>
        </div>
        <span className="score">
          {casino.score}
          <small>/10</small>
        </span>
      </div>

      <p className="casino-description">{casino.description}</p>

      <div className="tag-row">
        {casino.tags.map((tag) => (
          <span className="tag" key={tag}>{tag}</span>
        ))}
      </div>

      <div className="casino-card-bottom">
        <div>
          <span className="confidence-label">SAMPLE CONFIDENCE</span>
          <span className={`confidence ${casino.confidence.toLowerCase()}`}>
            <span className="confidence-dot" />
            {casino.confidence}
          </span>
        </div>

        <button
          className={`compare-button ${selected ? "selected" : ""}`}
          onClick={onSelect}
          aria-pressed={selected}
        >
          {selected ? "Selected ✓" : "+ Compare"}
        </button>
      </div>
    </article>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All casinos");
  const [selected, setSelected] = useState<number[]>([]);

  const filteredCasinos = useMemo(() => {
    return casinos.filter((casino) => {
      const matchesSearch =
        `${casino.name} ${casino.description} ${casino.tags.join(" ")}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        activeFilter === "All casinos" ||
        casino.category === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  function toggleCompare(id: number) {
    setSelected((previous) => {
      if (previous.includes(id)) {
        return previous.filter((item) => item !== id);
      }
      if (previous.length >= 3) {
        return previous;
      }
      return [...previous, id];
    });
  }

  const selectedCasinos = casinos.filter((casino) =>
    selected.includes(casino.id)
  );

  return (
    <main>
      <div className="announcement">
        <span className="announcement-dot" />
        BUILDING A MORE TRANSPARENT ONLINE CASINO INDUSTRY
        <span className="announcement-right">RESEARCH PLATFORM · MVP 01</span>
      </div>

      <header className="site-header">
        <a href="#" className="brand">
          <span className="brand-symbol">C<span>.</span></span>
          <span className="brand-name">CASINO<span>INTEL</span></span>
        </a>

        <nav className="main-nav">
          <a href="#directory">Casino directory</a>
          <a href="#methodology">Methodology</a>
          <a href="#research">Research</a>
        </nav>

        <a className="header-button" href="#directory">
          Explore platform <ArrowIcon />
        </a>
      </header>

      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            THE CASINO INTELLIGENCE PLATFORM
          </div>

          <h1>
            Know more.
            <br />
            <span>Choose smarter.</span>
          </h1>

          <p className="hero-description">
            Independent research, transparent ratings and deeper
            intelligence on online casinos around the world.
          </p>

          <div className="search-box">
            <SearchIcon />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                document.getElementById("directory")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              placeholder="Search casinos, operators, countries..."
              aria-label="Search casinos"
            />
            <a href="#directory" className="search-submit">
              Explore <ArrowIcon />
            </a>
          </div>

          <div className="hero-footnote">
            <span>01 / RESEARCH</span>
            <span>02 / VERIFY</span>
            <span>03 / COMPARE</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="visual-center">
            <span className="visual-center-icon">C.</span>
            <span>INTELLIGENCE</span>
            <strong>BEYOND THE ODDS</strong>
          </div>
          <div className="floating-card floating-top">
            <span className="mini-dot" /> RESEARCH STATUS
            <strong>Evidence-led</strong>
          </div>
          <div className="floating-card floating-bottom">
            <span className="mini-dot" /> SCORING MODEL
            <strong>Transparent ratings</strong>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div>
          <span className="strip-number">01</span>
          <span>Evidence-based research</span>
        </div>
        <div>
          <span className="strip-number">02</span>
          <span>Transparent methodology</span>
        </div>
        <div>
          <span className="strip-number">03</span>
          <span>Country-specific insights</span>
        </div>
        <div>
          <span className="strip-number">04</span>
          <span>Independent editorial review</span>
        </div>
      </section>

      <section className="directory-section" id="directory">
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> EXPLORE THE DATABASE
            </div>
            <h2>Casino intelligence.</h2>
            <p>Explore the directory and compare research profiles.</p>
          </div>
          <span className="section-count">SAMPLE DATABASE / 006 ENTRIES</span>
        </div>

        <div className="directory-toolbar">
          <div className="filter-list">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`filter-chip ${
                  activeFilter === filter ? "active" : ""
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <span className="result-count">
            {filteredCasinos.length} SAMPLE RESULTS
          </span>
        </div>

        <div className="casino-grid">
          {filteredCasinos.map((casino) => (
            <CasinoCard
              key={casino.id}
              casino={casino}
              selected={selected.includes(casino.id)}
              onSelect={() => toggleCompare(casino.id)}
            />
          ))}
        </div>

        {filteredCasinos.length === 0 && (
          <div className="empty-state">
            <span>NO MATCHES FOUND</span>
            <p>Try another search term or category.</p>
            <button onClick={() => {
              setSearch("");
              setActiveFilter("All casinos");
            }}>
              Clear filters
            </button>
          </div>
        )}
      </section>

      {selected.length > 0 && (
        <section className="comparison-panel" id="compare">
          <div>
            <span className="confidence-label">COMPARISON WORKSPACE</span>
            <strong>{selected.length} of 3 profiles selected</strong>
          </div>
          <div className="comparison-names">
            {selectedCasinos.map((casino) => (
              <span key={casino.id}>{casino.name}</span>
            ))}
          </div>
          <button
            className="compare-action"
            onClick={() =>
              document.getElementById("comparison-table")?.scrollIntoView({
                behavior: "smooth",
              })
            }
            disabled={selected.length < 2}
          >
            Compare profiles <ArrowIcon />
          </button>
          <button
            className="clear-selection"
            onClick={() => setSelected([])}
          >
            Clear
          </button>
        </section>
      )}

      {selected.length >= 2 && (
        <section className="comparison-section" id="comparison-table">
          <div className="eyebrow">SIDE-BY-SIDE RESEARCH</div>
          <h2>Compare profiles.</h2>
          <div className="comparison-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Research metric</th>
                  {selectedCasinos.map((casino) => (
                    <th key={casino.id}>{casino.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Illustrative score</td>
                  {selectedCasinos.map((casino) => (
                    <td key={casino.id}>{casino.score}/10</td>
                  ))}
                </tr>
                <tr>
                  <td>Sample confidence</td>
                  {selectedCasinos.map((casino) => (
                    <td key={casino.id}>{casino.confidence}</td>
                  ))}
                </tr>
                <tr>
                  <td>Category</td>
                  {selectedCasinos.map((casino) => (
                    <td key={casino.id}>{casino.category}</td>
                  ))}
                </tr>
                <tr>
                  <td>Evidence status</td>
                  {selectedCasinos.map((casino) => (
                    <td key={casino.id}>Demonstration only</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="methodology-section" id="methodology">
        <div className="methodology-copy">
          <div className="eyebrow">
            <span className="eyebrow-line" /> HOW WE THINK
          </div>
          <h2>
            A rating should
            <br />
            mean something.
          </h2>
          <p>
            Our planned scoring framework evaluates licensing, games,
            payments, bonuses, withdrawals, user experience and
            responsible gambling. Every factual claim must be traceable
            to evidence.
          </p>
          <span className="methodology-note">
            METHODOLOGY VERSION 0.1 · PROPOSED FRAMEWORK
          </span>
        </div>

        <div className="methodology-stats">
          {[
            ["25%", "Licensing & trust"],
            ["20%", "Games & software"],
            ["15%", "Payments"],
            ["15%", "Bonuses"],
            ["10%", "Withdrawal conditions"],
            ["10%", "User experience"],
            ["05%", "Responsible gambling"],
          ].map(([weight, label]) => (
            <div className="weight-row" key={label}>
              <strong>{weight}</strong>
              <span>{label}</span>
              <div className="weight-track">
                <div style={{ width: weight }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="research-section" id="research">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> BUILT ON EVIDENCE
          </div>
          <h2>Information is only valuable when it is verified.</h2>
          <p>
            The platform is being designed to distinguish verified,
            unverified, conflicting and outdated information. Sample
            content on this page has not been researched or verified.
          </p>
        </div>
        <div className="research-stamp">
          <span>RESEARCH FIRST</span>
          <strong>C.</strong>
          <span>TRANSPARENCY ALWAYS</span>
        </div>
      </section>

      <CasinoIntelRadar />

      <footer className="site-footer">
        <a href="#" className="brand">
          <span className="brand-symbol">C<span>.</span></span>
          <span className="brand-name">CASINO<span>INTEL</span></span>
        </a>
        <p>Independent research. Informed perspectives.</p>
        <span>© 2026 CASINO INTEL · DEVELOPMENT EDITION</span>
      </footer>

      <div className="demo-disclaimer">
        DEVELOPMENT PREVIEW · ALL CASINO PROFILES, SCORES AND CONFIDENCE
        LABELS ARE FICTIONAL DEMONSTRATION DATA.
      </div>
    </main>
  );
}
