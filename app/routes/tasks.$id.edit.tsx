import { useParams } from "react-router";
import { TaskForm } from "~/features/tasks/components/TaskForm";

export default function TaskEditRoute() {
  const { id } = useParams<{ id: string }>();
  return <TaskForm taskId={id} />;
}
