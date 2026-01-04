/**
 * Notifications Queue Component
 * Displays notification queue entries
 */

import { useState } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { PageLayout } from "~/components/layout/PageLayout";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { 
  SearchIcon,
  DownloadIcon,
  UploadIcon,
  PlugIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  useNotificationQueue, 
  useSendNotification, 
  useRetryNotification,
  useDeleteNotification 
} from "~/features/notifications/hooks/useNotifications";
import type { NotificationQueue, NotificationSendRequest } from "~/features/notifications/types/notifications.types";

export function NotificationsQueue() {
  const { t } = useTranslation();
  const { data: queueResponse, isLoading, error, refetch } = useNotificationQueue();
  const sendNotification = useSendNotification();
  const retryNotification = useRetryNotification();
  const deleteNotification = useDeleteNotification();

  const queue = queueResponse?.data || [];
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [channelFilter, setChannelFilter] = useState<string>("");

  const filteredQueue = queue.filter(item => {
    const matchesSearch = item.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.recipient_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || item.status === statusFilter;
    const matchesChannel = !channelFilter || item.channel === channelFilter;
    return matchesSearch && matchesStatus && matchesChannel;
  });

  const handleRetry = async (notificationId: string) => {
    try {
      await retryNotification.mutateAsync(notificationId);
      refetch();
    } catch (error) {
      console.error("Error retrying notification:", error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    if (confirm("Are you sure you want to delete this notification?")) {
      try {
        await deleteNotification.mutateAsync(notificationId);
        refetch();
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    }
  };

  const handleResend = async (item: NotificationQueue) => {
    try {
      const resendData: NotificationSendRequest = {
        event_type: item.event_type,
        recipient_id: item.recipient_id,
        channels: [item.channel],
        data: item.data || {},
      };
      
      await sendNotification.mutateAsync(resendData);
      refetch();
    } catch (error) {
      console.error("Error resending notification:", error);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "sent":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (status: string): string => {
    switch (status) {
      case "pending":
        return "bg-yellow-500 text-white";
      case "sent":
        return "bg-green-500 text-white";
      case "failed":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getChannelColor = (channel: string): string => {
    switch (channel) {
      case "email":
        return "bg-blue-100 text-blue-800";
      case "sms":
        return "bg-purple-100 text-purple-800";
      case "webhook":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="Notifications Queue" loading>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Notifications Queue" error={error}>
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Error loading notifications queue</p>
          <Button onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Notifications Queue">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <HugeiconsIcon icon={SearchIcon} size={16} className="absolute left-3 top-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:border-blue-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg focus:ring-2 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </select>
            
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="border border-gray-300 rounded-lg focus:ring-2 focus:border-blue-500"
            >
              <option value="">All Channels</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="webhook">Webhook</option>
            </select>
          </div>
          
          <Button onClick={() => refetch()}>
            <HugeiconsIcon icon={DownloadIcon} size={16} className="mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-600">{queue.length}</div>
              <p className="text-sm text-gray-600">Total notifications</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {queue.filter(q => q.status === "pending").length}
              </div>
              <p className="text-sm text-gray-600">Pending notifications</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {queue.filter(q => q.status === "sent").length}
              </div>
              <p className="text-sm text-gray-600">Sent notifications</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {queue.filter(q => q.status === "failed").length}
              </div>
              <p className="text-sm text-gray-600">Failed notifications</p>
            </CardContent>
          </Card>
        </div>

        {/* Queue List */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications Queue</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredQueue.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No notifications found</p>
                <p className="text-sm text-gray-400">
                  {searchTerm || statusFilter || channelFilter 
                    ? "No notifications match your filters" 
                    : "No notifications in queue"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQueue.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <Badge className={getStatusBadge(item.status)}>
                            {item.status}
                          </Badge>
                          <Badge className={getChannelColor(item.channel)}>
                            {item.channel}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <div className="font-medium text-gray-900">Event: {item.event_type}</div>
                          <div>Recipient: {item.recipient_id}</div>
                          <div>Template: {item.template_id || "No template"}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/notifications/queue/${item.id}`, '_blank')}
                        >
                          <HugeiconsIcon icon={DownloadIcon} size={16} className="mr-2" />
                          View
                        </Button>
                        
                        {item.status === "failed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetry(item.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <HugeiconsIcon icon={DownloadIcon} size={16} className="mr-2" />
                            Retry
                          </Button>
                        )}
                        
                        {item.status === "failed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResend(item)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <HugeiconsIcon icon={PlugIcon} size={16} className="mr-2" />
                            Resend
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <HugeiconsIcon icon={UploadIcon} size={16} className="mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    
                    {/* Timestamps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <label className="font-medium text-gray-700">Created</label>
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon icon={DownloadIcon} size={16} className="text-gray-400" />
                          <span>{new Date(item.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      <div>
                        <label className="font-medium text-gray-700">Sent</label>
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon icon={PlugIcon} size={16} className="text-gray-400" />
                          <span>
                            {item.sent_at ? new Date(item.sent_at).toLocaleString() : "Not sent yet"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Error Message */}
                    {item.error_message && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <HugeiconsIcon icon={UploadIcon} size={16} className="text-red-500" />
                          <span className="font-medium text-red-800">Error Message</span>
                        </div>
                        <p className="text-sm text-red-700">{item.error_message}</p>
                      </div>
                    )}
                    
                    {/* Data Preview */}
                    {item.data && Object.keys(item.data).length > 0 && (
                      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <HugeiconsIcon icon={DownloadIcon} size={16} className="text-gray-500" />
                          <span className="font-medium text-gray-800">Notification Data</span>
                        </div>
                        <pre className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-300 overflow-x-auto">
                          {JSON.stringify(item.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
