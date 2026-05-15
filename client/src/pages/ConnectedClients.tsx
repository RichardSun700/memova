import { useEffect, useState } from "react";
import {
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { useLocation } from "wouter";
import AccountShell from "@/components/account/AccountShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  listMcpConnections,
  revokeMcpConnection,
  type McpConnection,
} from "@/lib/api";
import { cn } from "@/lib/utils";

export default function ConnectedClients() {
  const [, setLocation] = useLocation();
  const auth = useAuth();
  const [connections, setConnections] = useState<McpConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadConnections = async (mode: "initial" | "refresh" = "initial") => {
    if (!auth.token) return;
    setError("");
    if (mode === "initial") setLoading(true);
    if (mode === "refresh") setRefreshing(true);
    try {
      setConnections(await listMcpConnections(auth.token));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load connected clients."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!auth.isAuthenticated) {
      setLocation(`/login?next=${encodeURIComponent("/connected-clients")}`);
      return;
    }
    void loadConnections();
  }, [auth.isAuthenticated, auth.token, setLocation]);

  const handleRevoke = async (connection: McpConnection) => {
    if (!auth.token || connection.status !== "active") return;
    const confirmed = window.confirm(
      `Revoke access for ${formatClientName(connection)}?`
    );
    if (!confirmed) return;

    setError("");
    setRevokingId(connection.connection_id);
    try {
      const revoked = await revokeMcpConnection(
        auth.token,
        connection.connection_id
      );
      setConnections(items =>
        items.map(item =>
          item.connection_id === revoked.connection_id ? revoked : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not revoke this client."
      );
    } finally {
      setRevokingId(null);
    }
  };

  if (!auth.isAuthenticated) return null;

  return (
    <AccountShell
      title="Connected clients"
      subtitle="MCP clients that have been authorized to access your Memova workspace."
      actions={
        <Button
          variant="outline"
          onClick={() => void loadConnections("refresh")}
          disabled={refreshing || loading}
          className="h-10 rounded-lg border-[#D4E9F7] text-[#2E5B82]"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      }
    >
      {loading ? (
        <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-[#DCEBF6] bg-white">
          <div className="flex items-center gap-3 text-[13px] font-semibold text-[#2E5B82]/65">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading connected clients
          </div>
        </div>
      ) : connections.length === 0 ? (
        <EmptyConnections />
      ) : (
        <div className="grid gap-4">
          {connections.map(connection => (
            <ConnectionCard
              key={connection.connection_id}
              connection={connection}
              revoking={revokingId === connection.connection_id}
              onRevoke={() => void handleRevoke(connection)}
            />
          ))}
        </div>
      )}

      {error && (
        <p className="mt-5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[12px] font-semibold text-[#B91C1C]">
          {error}
        </p>
      )}
    </AccountShell>
  );
}

function ConnectionCard({
  connection,
  revoking,
  onRevoke,
}: {
  connection: McpConnection;
  revoking: boolean;
  onRevoke: () => void;
}) {
  return (
    <Card className="rounded-xl border-[#DCEBF6] bg-white shadow-lg shadow-[#2E5B82]/[0.04]">
      <CardHeader className="gap-4 md:grid-cols-[1fr_auto]">
        <div className="flex min-w-0 items-start gap-4">
          <ClientMark connection={connection} />
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <CardTitle className="break-words text-xl text-[#0F2B3C]">
                {formatClientName(connection)}
              </CardTitle>
              <StatusBadge status={connection.status} />
            </div>
            <CardDescription className="break-words text-[#2E5B82]/55">
              {formatClientSubtitle(connection)}
            </CardDescription>
          </div>
        </div>
        <Button
          variant="outline"
          disabled={revoking || connection.status !== "active"}
          onClick={onRevoke}
          className="h-10 rounded-lg border-[#FECACA] text-[#B91C1C] hover:bg-[#FEF2F2]"
        >
          {revoking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldX className="h-4 w-4" />
          )}
          Revoke
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          <InfoBlock
            label="Connected"
            value={formatDate(connection.connected_at)}
          />
          <InfoBlock
            label="Last used"
            value={formatDate(connection.last_used_at)}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {connection.scopes.map(scope => (
            <Badge
              key={scope}
              variant="outline"
              className="border-[#D4E9F7] bg-[#F8FBFE] px-2.5 py-1 text-[#2E5B82]"
            >
              {scope}
            </Badge>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-[12px] font-semibold text-[#2E5B82]/55">
          <span className="break-all">Resource: {connection.resource}</span>
          {connection.client_uri && (
            <a
              href={connection.client_uri}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[#2E5B82] hover:text-[#0F2B3C]"
            >
              Client site
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
        status === "active" && "bg-[#D1FAE5] text-[#065F46]",
        status === "revoked" && "bg-[#FEE2E2] text-[#B91C1C]",
        status !== "active" &&
          status !== "revoked" &&
          "bg-[#FEF3C7] text-[#B45309]"
      )}
    >
      {status === "active" ? (
        <ShieldCheck className="h-3 w-3" />
      ) : (
        <ShieldX className="h-3 w-3" />
      )}
      {status}
    </span>
  );
}

function ClientMark({ connection }: { connection: McpConnection }) {
  if (connection.logo_uri) {
    return (
      <img
        alt=""
        src={connection.logo_uri}
        className="h-14 w-14 rounded-xl border border-[#DCEBF6] object-cover"
      />
    );
  }
  const initial = (connection.client_name || connection.client_id || "M")
    .slice(0, 1)
    .toUpperCase();
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#0F2B3C] text-lg font-bold text-white">
      {initial}
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#EDF3FA] bg-[#FAFCFF] px-4 py-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#2E5B82]/45">
        {label}
      </div>
      <div className="mt-1 break-words text-[13px] font-semibold text-[#0F2B3C]">
        {value}
      </div>
    </div>
  );
}

function EmptyConnections() {
  return (
    <div className="rounded-xl border border-[#DCEBF6] bg-white px-6 py-12 text-center shadow-lg shadow-[#2E5B82]/[0.04]">
      <ShieldCheck className="mx-auto h-10 w-10 text-[#2E5B82]" />
      <h2 className="mt-4 text-lg font-bold text-[#0F2B3C]">
        No connected clients
      </h2>
      <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-[#2E5B82]/60">
        MCP clients will appear here after you approve an authorization request.
      </p>
    </div>
  );
}

function formatDate(value?: string | null): string {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatClientSubtitle(connection: McpConnection): string {
  if (!connection.client_uri) return "MCP client";

  try {
    return new URL(connection.client_uri).hostname;
  } catch {
    return connection.client_uri;
  }
}

function formatClientName(connection: McpConnection): string {
  return connection.client_name?.trim() || "MCP client";
}
