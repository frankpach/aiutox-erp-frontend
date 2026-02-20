/**
 * PubSub Stream View component
 * Detailed view of a single PubSub stream
 */

import { useState } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { DataTable } from "~/components/common/DataTable";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { EmptyState } from "~/components/common/EmptyState";
import { LoadingState } from "~/components/common/LoadingState";
import { ErrorState } from "~/components/common/ErrorState";
import { 
  usePubSubStream,
  usePubSubGroups,
  useCreatePubSubGroup,
  useDeletePubSubGroup,
  useAddPubSubMessage,
  useClearPubSubStream,
  useTrimPubSubStream
} from "../hooks/usePubSub";
import type { PubSubStream, PubSubGroup, PubSubStreamEntry } from "../types/pubsub.types";

interface PubSubStreamViewProps {
  streamName: string;
  onBack?: () => void;
  onGroupView?: (streamName: string, groupName: string) => void;
}

export function PubSubStreamView({ streamName, onBack, onGroupView }: PubSubStreamViewProps) {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("overview");

  // Queries
  const { data: stream, isLoading: streamLoading, error: streamError, refetch: refetchStream } = usePubSubStream(streamName);
  const { data: groups, isLoading: groupsLoading, error: groupsError, refetch: refetchGroups } = usePubSubGroups(streamName);

  const createGroupMutation = useCreatePubSubGroup();
  const deleteGroupMutation = useDeletePubSubGroup();
  const addMessageMutation = useAddPubSubMessage();
  const clearStreamMutation = useClearPubSubStream();
  const trimStreamMutation = useTrimPubSubStream();

  const handleCreateGroup = async (groupName: string) => {
    try {
      await createGroupMutation.mutateAsync({
        name: groupName,
        stream_name: streamName,
      });
      refetchGroups();
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  const handleDeleteGroup = async (groupName: string) => {
    try {
      await deleteGroupMutation.mutateAsync({
        streamName,
        groupName,
      });
      refetchGroups();
    } catch (error) {
      console.error("Failed to delete group:", error);
    }
  };

  const handleAddMessage = async (data: Record<string, unknown>) => {
    try {
      await addMessageMutation.mutateAsync({
        stream_name: streamName,
        data,
      });
      refetchStream();
    } catch (error) {
      console.error("Failed to add message:", error);
    }
  };

  const handleClearStream = async () => {
    try {
      await clearStreamMutation.mutateAsync(streamName);
      refetchStream();
      refetchGroups();
    } catch (error) {
      console.error("Failed to clear stream:", error);
    }
  };

  const handleTrimStream = async () => {
    try {
      await trimStreamMutation.mutateAsync({
        name: streamName,
        strategy: "maxlen",
        threshold: 1000
      });
      refetchStream();
    } catch (error) {
      console.error("Failed to trim stream:", error);
    }
  };

  // Overview tab
  const renderOverview = () => {
    if (streamLoading) {
      return <LoadingState />;
    }

    if (streamError) {
      return <ErrorState message={t("pubsub.error.loading")} />;
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("pubsub.stream.overview")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <h4 className="font-medium">{t("pubsub.stream.name")}</h4>
                <p className="text-sm text-gray-600">{stream?.name}</p>
              </div>
              <div>
                <h4 className="font-medium">{t("pubsub.stream.length")}</h4>
                <p className="text-sm text-gray-600">{stream?.length}</p>
              </div>
              <div>
                <h4 className="font-medium">{t("pubsub.stream.groups")}</h4>
                <p className="text-sm text-gray-600">{stream?.groups}</p>
              </div>
              <div>
                <h4 className="font-medium">{t("pubsub.stream.pending")}</h4>
                <p className="text-sm text-gray-600">{stream?.pending}</p>
              </div>
              <div>
                <h4 className="font-medium">{t("pubsub.stream.firstEntry")}</h4>
                <p className="text-sm text-gray-600">{stream?.first_entry_id || "-"}</p>
              </div>
              <div>
                <h4 className="font-medium">{t("pubsub.stream.lastEntry")}</h4>
                <p className="text-sm text-gray-600">{stream?.last_entry_id || "-"}</p>
              </div>
              <div>
                <h4 className="font-medium">{t("pubsub.stream.lastRead")}</h4>
                <p className="text-sm text-gray-600">
                  {stream?.last_read 
                    ? new Date(stream.last_read).toLocaleString()
                    : "-"
                  }
                </p>
              </div>
              <div>
                <h4 className="font-medium">{t("pubsub.stream.createdAt")}</h4>
                <p className="text-sm text-gray-600">
                  {stream?.created_at 
                    ? new Date(stream.created_at).toLocaleString()
                    : "-"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("pubsub.stream.actions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleClearStream}
                disabled={clearStreamMutation.isPending}
              >
                {t("pubsub.stream.clear")}
              </Button>
              <Button
                variant="outline"
                onClick={handleTrimStream}
                disabled={trimStreamMutation.isPending}
              >
                {t("pubsub.stream.trim")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Groups tab
  const renderGroups = () => {
    if (groupsLoading) {
      return <LoadingState />;
    }

    if (groupsError) {
      return <ErrorState message={t("pubsub.error.loading")} />;
    }

    const groupsList = groups?.data || [];

    if (groupsList.length === 0) {
      return (
        <EmptyState
          title={t("pubsub.groups.empty.title")}
          description={t("pubsub.groups.empty.description")}
        />
      );
    }

    const columns = [
      {
        key: "name",
        title: t("pubsub.groups.table.name"),
        render: (group: PubSubGroup) => (
          <div>
            <div className="font-medium">{group.name}</div>
            <div className="text-sm text-gray-500">{group.consumers} consumers</div>
          </div>
        ),
      },
      {
        key: "pending",
        title: t("pubsub.groups.table.pending"),
        render: (group: PubSubGroup) => (
          <Badge variant={group.pending > 0 ? "destructive" : "secondary"}>
            {group.pending}
          </Badge>
        ),
      },
      {
        key: "last_delivered",
        title: t("pubsub.groups.table.lastDelivered"),
        render: (group: PubSubGroup) => (
          <div className="text-sm">
            {group.last_delivered_id 
              ? group.last_delivered_id.substring(0, 8) + "..."
              : "-"
            }
          </div>
        ),
      },
      {
        key: "created_at",
        title: t("pubsub.groups.table.createdAt"),
        render: (group: PubSubGroup) => (
          <div className="text-sm">
            {group.created_at 
              ? new Date(group.created_at).toLocaleString()
              : "-"
            }
          </div>
        ),
      },
      {
        key: "actions",
        title: t("pubsub.groups.table.actions"),
        render: (group: PubSubGroup) => (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onGroupView?.(streamName, group.name)}
            >
              {t("common.view")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteGroup(group.name)}
              disabled={deleteGroupMutation.isPending}
              className="text-red-600 hover:text-red-700"
            >
              {t("common.delete")}
            </Button>
          </div>
        ),
      },
    ];

    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("pubsub.groups.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={groupsList}
            columns={columns}
          />
        </CardContent>
      </Card>
    );
  };

  // Messages tab
  const renderMessages = () => {
    if (streamLoading) {
      return <LoadingState />;
    }

    if (streamError) {
      return <ErrorState message={t("pubsub.error.loading")} />;
    }

    const messages = stream?.entries || [];

    if (messages.length === 0) {
      return (
        <EmptyState
          title={t("pubsub.messages.empty.title")}
          description={t("pubsub.messages.empty.description")}
        />
      );
    }

    const columns = [
      {
        key: "id",
        title: t("pubsub.messages.table.id"),
        render: (entry: PubSubStreamEntry) => (
          <div className="font-mono text-sm">{entry.id.substring(0, 8)}...</div>
        ),
      },
      {
        key: "data",
        title: t("pubsub.messages.table.data"),
        render: (entry: PubSubStreamEntry) => (
          <div className="text-sm">
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-w-xs">
              {JSON.stringify(entry.data, null, 2)}
            </pre>
          </div>
        ),
      },
      {
        key: "timestamp",
        title: t("pubsub.messages.table.timestamp"),
        render: (entry: PubSubStreamEntry) => (
          <div className="text-sm">
            {new Date(entry.timestamp).toLocaleString()}
          </div>
        ),
      },
      {
        key: "sequence",
        title: t("pubsub.messages.table.sequence"),
        render: (entry: PubSubStreamEntry) => (
          <div className="text-sm">{entry.sequence}</div>
        ),
      },
    ];

    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("pubsub.messages.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={messages}
            columns={columns}
          />
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">{t("pubsub.stream.title")}</h1>
          <Badge variant="outline">{streamName}</Badge>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            {t("common.back")}
          </Button>
        )}
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">{t("pubsub.stream.tabs.overview")}</TabsTrigger>
          <TabsTrigger value="groups">{t("pubsub.stream.tabs.groups")}</TabsTrigger>
          <TabsTrigger value="messages">{t("pubsub.stream.tabs.messages")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          {renderGroups()}
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          {renderMessages()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
