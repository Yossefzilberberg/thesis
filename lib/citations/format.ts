// A pragmatic citation formatter for the most common styles used in
// Israeli graduate research: APA 7, Harvard (Cite Them Right 12),
// Chicago 17 (author-date and notes), MLA 9, Vancouver, IEEE.
// This implementation covers the high-frequency cases (journal article,
// book, book chapter, conference paper, thesis, report, website,
// dataset, preprint). It is intentionally readable rather than exhaustive
// — the AI layer is responsible for edge-case formatting on demand.

import type { CitationStyle, Reference } from "../types";

function authorList(refAuthors: Reference["authors"]): { family: string; given: string }[] {
  return refAuthors ?? [];
}

function initials(given: string) {
  return given
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase() + ".")
    .join(" ");
}

function joinNames(authors: { family: string; given: string }[], style: CitationStyle, intext: boolean) {
  const fmtFull = (a: { family: string; given: string }) => {
    switch (style) {
      case "apa7":
      case "harvard":
      case "chicago_author_date":
        return `${a.family}, ${initials(a.given)}`;
      case "chicago_notes":
        return intext ? `${a.given} ${a.family}` : `${a.family}, ${a.given}`;
      case "mla9":
        return `${a.family}, ${a.given}`;
      case "vancouver":
        return `${a.family} ${initials(a.given).replace(/\./g, "")}`;
      case "ieee":
        return `${initials(a.given)} ${a.family}`;
    }
  };
  const list = authors.map(fmtFull);

  if (style === "vancouver") {
    if (list.length > 6) return list.slice(0, 6).join(", ") + ", et al.";
    return list.join(", ");
  }
  if (style === "ieee") {
    if (list.length > 3) return list[0] + " et al.";
    if (list.length === 1) return list[0];
    return list.slice(0, -1).join(", ") + ", and " + list[list.length - 1];
  }
  if (list.length === 1) return list[0];
  if (list.length === 2) {
    if (style === "apa7" || style === "harvard" || style === "chicago_author_date")
      return list.join(", & ").replace(", & ", intext ? " & " : ", & ");
    return list.join(" and ");
  }
  if (list.length >= 3) {
    if (style === "apa7") {
      if (intext) return list[0].split(",")[0] + " et al.";
      return list.slice(0, -1).join(", ") + ", & " + list[list.length - 1];
    }
    if (style === "harvard" || style === "chicago_author_date") {
      if (intext && list.length > 3) return list[0].split(",")[0] + " et al.";
      return list.slice(0, -1).join(", ") + ", and " + list[list.length - 1];
    }
    if (style === "mla9") {
      if (list.length > 2) return list[0] + ", et al.";
      return list.join(", and ");
    }
    return list.slice(0, -1).join(", ") + ", and " + list[list.length - 1];
  }
  return "";
}

function italic(s: string) {
  // Surround with markers the editor renders as <em>. We use ⟨i⟩…⟨/i⟩
  // so the formatter output is plain-text safe and the renderer can
  // map the markers to italics in the editor.
  return `⟨i⟩${s}⟨/i⟩`;
}

export function formatReferenceList(ref: Reference, style: CitationStyle): string {
  const authors = joinNames(authorList(ref.authors), style, false);
  const year = ref.year ?? "n.d.";
  const title = ref.title?.trim() ?? "";
  const container = ref.containerTitle?.trim();
  const vol = ref.volume;
  const iss = ref.issue;
  const pages = ref.pages;
  const doi = ref.doi ? `https://doi.org/${ref.doi}` : ref.url;

  switch (style) {
    case "apa7": {
      switch (ref.type) {
        case "journal_article":
          return `${authors} (${year}). ${title}. ${italic(container ?? "")}, ${italic(vol ?? "")}${iss ? `(${iss})` : ""}${pages ? `, ${pages}` : ""}.${doi ? ` ${doi}` : ""}`.replace(/\s+/g, " ").trim();
        case "book":
          return `${authors} (${year}). ${italic(title)}${ref.edition ? ` (${ref.edition} ed.)` : ""}. ${ref.publisher ?? ""}.${doi ? ` ${doi}` : ""}`.trim();
        case "book_chapter":
          return `${authors} (${year}). ${title}. In ${ref.editors ? joinNames(ref.editors, style, false) + " (Eds.), " : ""}${italic(container ?? "")}${pages ? ` (pp. ${pages})` : ""}. ${ref.publisher ?? ""}.`;
        case "conference_paper":
          return `${authors} (${year}). ${title}. In ${italic(container ?? "")}${pages ? ` (pp. ${pages})` : ""}. ${ref.publisher ?? ""}.${doi ? ` ${doi}` : ""}`;
        case "thesis":
          return `${authors} (${year}). ${italic(title)} [${ref.notes ?? "Doctoral dissertation"}]. ${ref.publisher ?? ""}.${ref.url ? ` ${ref.url}` : ""}`;
        case "report":
          return `${authors} (${year}). ${italic(title)} (Report). ${ref.publisher ?? ""}.${doi ? ` ${doi}` : ""}`;
        case "website":
          return `${authors} (${year}). ${italic(title)}. ${ref.publisher ?? ""}.${ref.url ? ` ${ref.url}` : ""}`;
        case "dataset":
          return `${authors} (${year}). ${italic(title)} [Data set]. ${ref.publisher ?? ""}.${doi ? ` ${doi}` : ""}`;
        case "preprint":
          return `${authors} (${year}). ${italic(title)} [Preprint]. ${ref.publisher ?? ""}.${doi ? ` ${doi}` : ""}`;
      }
      return "";
    }
    case "harvard": {
      switch (ref.type) {
        case "journal_article":
          return `${authors} (${year}) '${title}', ${italic(container ?? "")}, ${vol}${iss ? `(${iss})` : ""}${pages ? `, pp. ${pages}` : ""}.${doi ? ` doi: ${ref.doi}` : ""}`;
        case "book":
          return `${authors} (${year}) ${italic(title)}${ref.edition ? `. ${ref.edition} edn` : ""}. ${ref.place ? ref.place + ": " : ""}${ref.publisher ?? ""}.`;
        case "book_chapter":
          return `${authors} (${year}) '${title}', in ${ref.editors ? joinNames(ref.editors, style, false) + " (eds) " : ""}${italic(container ?? "")}. ${ref.place ? ref.place + ": " : ""}${ref.publisher ?? ""}${pages ? `, pp. ${pages}` : ""}.`;
        case "conference_paper":
          return `${authors} (${year}) '${title}', ${italic(container ?? "")}${pages ? `, pp. ${pages}` : ""}.${doi ? ` doi: ${ref.doi}` : ""}`;
        case "thesis":
          return `${authors} (${year}) ${italic(title)}. ${ref.notes ?? "PhD thesis"}. ${ref.publisher ?? ""}.`;
        case "website":
          return `${authors} (${year}) ${italic(title)}. Available at: ${ref.url ?? ""} (Accessed: ${new Date().toLocaleDateString("en-GB")}).`;
        default:
          return `${authors} (${year}) ${italic(title)}. ${ref.publisher ?? ""}.`;
      }
    }
    case "chicago_author_date": {
      switch (ref.type) {
        case "journal_article":
          return `${authors}. ${year}. "${title}." ${italic(container ?? "")} ${vol}${iss ? ` (${iss})` : ""}: ${pages ?? ""}.${doi ? ` https://doi.org/${ref.doi}.` : ""}`;
        case "book":
          return `${authors}. ${year}. ${italic(title)}. ${ref.place ? ref.place + ": " : ""}${ref.publisher ?? ""}.`;
        default:
          return `${authors}. ${year}. ${italic(title)}. ${ref.publisher ?? ""}.`;
      }
    }
    case "chicago_notes": {
      // Bibliography form (notes form is generated by formatInText).
      switch (ref.type) {
        case "journal_article":
          return `${authors}. "${title}." ${italic(container ?? "")} ${vol}${iss ? `, no. ${iss}` : ""} (${year}): ${pages ?? ""}.${doi ? ` https://doi.org/${ref.doi}.` : ""}`;
        case "book":
          return `${authors}. ${italic(title)}. ${ref.place ? ref.place + ": " : ""}${ref.publisher ?? ""}, ${year}.`;
        default:
          return `${authors}. ${italic(title)}. ${ref.publisher ?? ""}, ${year}.`;
      }
    }
    case "mla9": {
      switch (ref.type) {
        case "journal_article":
          return `${authors}. "${title}." ${italic(container ?? "")}, vol. ${vol}${iss ? `, no. ${iss}` : ""}, ${year}, pp. ${pages ?? ""}.${doi ? ` https://doi.org/${ref.doi}.` : ""}`;
        case "book":
          return `${authors}. ${italic(title)}. ${ref.publisher ?? ""}, ${year}.`;
        case "website":
          return `${authors}. "${title}." ${italic(ref.publisher ?? "")}, ${year}, ${ref.url ?? ""}.`;
        default:
          return `${authors}. ${italic(title)}. ${ref.publisher ?? ""}, ${year}.`;
      }
    }
    case "vancouver": {
      switch (ref.type) {
        case "journal_article":
          return `${authors}. ${title}. ${container ?? ""}. ${year};${vol ?? ""}${iss ? `(${iss})` : ""}:${pages ?? ""}.${doi ? ` doi:${ref.doi}` : ""}`;
        case "book":
          return `${authors}. ${title}. ${ref.edition ? ref.edition + " ed. " : ""}${ref.place ? ref.place + ": " : ""}${ref.publisher ?? ""}; ${year}.`;
        default:
          return `${authors}. ${title}. ${ref.publisher ?? ""}; ${year}.`;
      }
    }
    case "ieee": {
      switch (ref.type) {
        case "journal_article":
          return `${authors}, "${title}," ${italic(container ?? "")}, vol. ${vol}, no. ${iss}, pp. ${pages}, ${year}.${doi ? ` doi: ${ref.doi}.` : ""}`;
        case "conference_paper":
          return `${authors}, "${title}," in ${italic(container ?? "")}, ${year}, pp. ${pages ?? ""}.`;
        case "book":
          return `${authors}, ${italic(title)}, ${ref.edition ? ref.edition + " ed. " : ""}${ref.place ? ref.place + ": " : ""}${ref.publisher ?? ""}, ${year}.`;
        default:
          return `${authors}, ${italic(title)}, ${ref.publisher ?? ""}, ${year}.`;
      }
    }
  }
}

export function formatInText(
  ref: Reference,
  style: CitationStyle,
  opts?: { locator?: string; suppressAuthor?: boolean; prefix?: string; suffix?: string },
): string {
  const a = authorList(ref.authors);
  const year = ref.year ?? "n.d.";
  const locator = opts?.locator ? `, ${opts.locator}` : "";
  const prefix = opts?.prefix ? `${opts.prefix} ` : "";
  const suffix = opts?.suffix ? ` ${opts.suffix}` : "";

  const familyOnly = (au: { family: string; given: string }) => au.family;
  const firstFamily = a[0] ? familyOnly(a[0]) : "Anon.";

  switch (style) {
    case "apa7":
    case "harvard":
    case "chicago_author_date": {
      let names: string;
      if (a.length === 1) names = firstFamily;
      else if (a.length === 2)
        names = `${firstFamily} ${style === "apa7" ? "&" : "and"} ${familyOnly(a[1])}`;
      else names = `${firstFamily} et al.`;
      const inner = opts?.suppressAuthor ? `${year}${locator}` : `${names}, ${year}${locator}`;
      return `(${prefix}${inner}${suffix})`;
    }
    case "chicago_notes": {
      const givenFamily = a[0] ? `${a[0].given} ${a[0].family}` : "Anon.";
      return `${prefix}${givenFamily}, "${ref.title}," ${ref.containerTitle ?? ""} ${ref.volume ?? ""} (${year}): ${opts?.locator ?? ref.pages ?? ""}.${suffix}`.trim();
    }
    case "mla9": {
      const inner = a.length > 2 ? `${firstFamily} et al.` : a.map(familyOnly).join(" and ");
      return `(${prefix}${inner}${opts?.locator ? " " + opts.locator : ""}${suffix})`;
    }
    case "vancouver":
    case "ieee":
      // Numeric citation systems: the editor assigns a number per
      // unique reference. We only expose the bracketed placeholder; the
      // numbering pass happens at render time.
      return `[${ref.id}]`;
  }
}

export function buildBibliography(refs: Reference[], style: CitationStyle): string[] {
  const sorted = [...refs].sort((a, b) => {
    if (style === "vancouver" || style === "ieee") return 0; // numeric: order by appearance externally
    const af = a.authors[0]?.family ?? "";
    const bf = b.authors[0]?.family ?? "";
    return af.localeCompare(bf);
  });
  return sorted.map((r) => formatReferenceList(r, style));
}
