import { type FC } from 'react';
import { type GetNotesHistoryRequest, noteApi } from '@/entities/note';
import { PageContainer } from '@/shared/ui';
import { NotesHistoryList } from '@/widgets/NotesHistoryList';

interface Props {
  notesHistoryRequest: GetNotesHistoryRequest;
}

export const HistoryPage: FC<Props> = ({ notesHistoryRequest }) => {
  const { data } = noteApi.useNotesHistoryQuery(notesHistoryRequest);

  return (
    <PageContainer>
      <NotesHistoryList notes={data?.notesHistory ?? []} />
    </PageContainer>
  );
};
