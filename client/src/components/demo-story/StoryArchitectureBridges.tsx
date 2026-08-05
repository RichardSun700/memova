import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  FileCode2,
  FileText,
  Link2,
  LockKeyhole,
  ScanText,
  Share2,
  ShieldCheck,
} from "lucide-react";

import "./story-architecture-bridges.css";

type ArchitectureStep = {
  number: string;
  label: string;
  title: string;
  detail: string;
  icon: LucideIcon;
};

const ARCHITECTURE_STEPS = [
  {
    number: "01",
    label: "Sources",
    title: "Scattered in.",
    detail:
      "Meetings, notes, files, and images arrive in the formats you already use.",
    icon: FileText,
  },
  {
    number: "02",
    label: "Book",
    title: "Connected in one Book.",
    detail:
      "Private context, evidence, and decisions remain editable and source-linked.",
    icon: BookOpen,
  },
  {
    number: "03",
    label: "Pages",
    title: "Shareable out.",
    detail:
      "One connected source becomes polished Pages and native platform voices—with your approval.",
    icon: Share2,
  },
] satisfies readonly ArchitectureStep[];

const SHARE_STEPS = [
  {
    number: "01",
    label: "Private",
    detail: "Source stays in your Book",
    icon: LockKeyhole,
  },
  {
    number: "02",
    label: "Auto-remove",
    detail: "Sensitive details are detected",
    icon: ScanText,
  },
  {
    number: "03",
    label: "Review",
    detail: "You approve every change",
    icon: ShieldCheck,
  },
  {
    number: "04",
    label: "Publish",
    detail: "Only the reviewed version leaves",
    icon: ArrowRight,
  },
] as const;

export function KnowledgeNoteActionOverview() {
  return (
    <ol
      className="architecture-overview"
      aria-label="Memova product flow overview"
    >
      {ARCHITECTURE_STEPS.map(step => {
        const Icon = step.icon;

        return (
          <li key={step.number} data-architecture-step={step.label}>
            <div className="architecture-overview__meta">
              <span>{step.number}</span>
              <strong>{step.label}</strong>
            </div>
            <Icon aria-hidden="true" strokeWidth={1.65} />
            <h3>{step.title}</h3>
            <p>{step.detail}</p>
          </li>
        );
      })}
    </ol>
  );
}

export function MarkdownHtmlBridge() {
  return (
    <aside
      className="source-format-bridge"
      data-story-narrative="markdown-to-html"
      aria-labelledby="source-format-bridge-title"
    >
      <div className="source-format-bridge__copy">
        <span>Markdown → source-linked HTML</span>
        <h3 id="source-format-bridge-title">Your work, already a webpage.</h3>
        <p>
          Your private, editable source stays in Markdown while Memova renders a
          source-linked HTML Page—ready to edit, link, and share.
        </p>
      </div>

      <div
        className="source-format-bridge__route"
        aria-label="Private Markdown becomes a source-linked HTML Page"
      >
        <article>
          <FileText aria-hidden="true" strokeWidth={1.6} />
          <div>
            <span>Private source</span>
            <strong>Editable Markdown</strong>
            <small>Local · portable · yours</small>
          </div>
        </article>

        <div className="source-format-bridge__link" aria-hidden="true">
          <Link2 strokeWidth={1.7} />
          <span>Source-linked</span>
          <ArrowRight strokeWidth={1.7} />
        </div>

        <article>
          <FileCode2 aria-hidden="true" strokeWidth={1.6} />
          <div>
            <span>Rendered output</span>
            <strong>HTML Page</strong>
            <small>Readable · interactive · shareable</small>
          </div>
        </article>
      </div>

      <p className="source-format-bridge__promise">
        The format changes. The source connection does not.
      </p>
    </aside>
  );
}

export function ControlledShareFlow() {
  return (
    <section
      className="controlled-share-flow"
      data-story-narrative="controlled-sharing"
      aria-labelledby="controlled-share-title"
    >
      <div className="controlled-share-flow__heading">
        <span>Sharing guardrail</span>
        <strong id="controlled-share-title">
          Private first. Ready when you are.
        </strong>
      </div>

      <ol aria-label="Controlled sharing steps">
        {SHARE_STEPS.map(step => {
          const Icon = step.icon;

          return (
            <li key={step.number} data-share-safety-step={step.label}>
              <span>{step.number}</span>
              <Icon aria-hidden="true" strokeWidth={1.7} />
              <div>
                <strong>{step.label}</strong>
                <small>{step.detail}</small>
              </div>
            </li>
          );
        })}
      </ol>

      <p>
        <ShieldCheck aria-hidden="true" strokeWidth={1.7} />
        Auto-remove sensitive details, then review before you publish.
      </p>
    </section>
  );
}
