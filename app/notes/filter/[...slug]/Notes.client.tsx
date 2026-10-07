"use client";

import { useEffect, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchNotes, noteQueryKeys } from "@/lib/api";
import NoteList from "@/components/NoteList/NoteList";
import Pagination from "@/components/Pagination/Pagination";
import Modal from "@/components/Modal/Modal";
import NoteForm from "@/components/NoteForm/NoteForm";
import SearchBox from "@/components/SearchBox/SearchBox";
import type { TagProps } from "@/types/note";
import css from "./NotesPage.module.css";

interface NotesClientProps {
  tag?: TagProps;
}

export default function NotesClient({ tag }: NotesClientProps) {
  const [inputValue, setInputValue] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setPage(1);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setDebouncedSearch(inputValue),
      1000,
    );
    return () => window.clearTimeout(timeoutId);
  }, [inputValue]);

  const { data, error, isLoading, isError } = useQuery({
    queryKey: noteQueryKeys.list({
      search: debouncedSearch,
      page,
      perPage: 12,
      tag,
    }),
    queryFn: () =>
      fetchNotes({
        search: debouncedSearch,
        page,
        perPage: 12,
        tag,
      }),
    placeholderData: keepPreviousData,
    refetchOnMount: false,
  });

  return (
    <div className={css.app}>
      <div className={css.toolbar}>
        <SearchBox onChange={handleChange} />
        {data && data.totalPages > 1 && (
          <Pagination
            pageCount={data.totalPages}
            onPageChange={({ selected }) => setPage(selected + 1)}
            forcePage={page - 1}
          />
        )}
        <button onClick={() => setIsModalOpen(true)} className={css.button}>
          Create note +
        </button>
      </div>
      {isModalOpen && (
        <Modal onClose={closeModal}>
          <NoteForm cancelModal={closeModal} />
        </Modal>
      )}
      {isLoading && <p>Loading notes...</p>}
      {isError && (
        <p role="alert">Could not fetch notes. {error.message}</p>
      )}
      {data && data.notes.length > 0 && <NoteList notes={data.notes} />}
      {data && data.notes.length === 0 && <p>No notes found.</p>}
    </div>
  );
}
