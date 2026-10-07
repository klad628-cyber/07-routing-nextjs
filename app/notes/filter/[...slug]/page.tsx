import { notFound } from "next/navigation";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import NotesClient from "./Notes.client";
import { fetchNotes, noteQueryKeys } from "@/lib/api";

const tags = ["Todo", "Work", "Personal", "Meeting", "Shopping"] as const;

export const dynamic = "force-dynamic";

export default async function NotesPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  if (slug.length !== 1) notFound();

  const filter = slug[0];
  const tag =
    filter === "all"
      ? undefined
      : tags.find((availableTag) => availableTag === filter);

  if (filter !== "all" && !tag) notFound();

  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000 } },
  });
  const paramsForNotes = {
    search: "",
    page: 1,
    perPage: 12,
    tag,
  };
  const queryKey = noteQueryKeys.list(paramsForNotes);

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => fetchNotes(paramsForNotes),
  });
  const queryError = queryClient.getQueryState(queryKey)?.error;
  if (queryError) throw queryError;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient tag={tag} />
    </HydrationBoundary>
  );
}
