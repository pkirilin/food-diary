import { Button } from '@mui/material';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { type FC, useState } from 'react';
import { render } from '@tests/render';
import { DiscardMealDraftDialog } from './DiscardMealDraftDialog';

interface LeaveWithDiscardPromptProps {
  foodLogsCount: number;
  onDiscard: () => void;
  onCancel: () => void;
}

// The prompt opens on a tap, as in the app: mounted by render instead, its auto-focused button
// starts a ripple that updates outside act()
const LeaveWithDiscardPrompt: FC<LeaveWithDiscardPromptProps> = ({
  foodLogsCount,
  onDiscard,
  onCancel,
}) => {
  const [prompted, setPrompted] = useState(false);

  return (
    <>
      <Button
        onClick={() => {
          setPrompted(true);
        }}
      >
        Back
      </Button>
      {prompted && (
        <DiscardMealDraftDialog
          foodLogsCount={foodLogsCount}
          onDiscard={() => {
            setPrompted(false);
            onDiscard();
          }}
          onCancel={() => {
            setPrompted(false);
            onCancel();
          }}
        />
      )}
    </>
  );
};

const leaveWithPickedProducts = async (user: UserEvent, foodLogsCount: number) => {
  const onDiscard = vi.fn<() => void>();
  const onCancel = vi.fn<() => void>();

  await render(
    <LeaveWithDiscardPrompt
      foodLogsCount={foodLogsCount}
      onDiscard={onDiscard}
      onCancel={onCancel}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Back' }));

  return { onDiscard, onCancel };
};

test('Discard on the prompt for the picked products discards them', async () => {
  const user = userEvent.setup();
  const { onDiscard, onCancel } = await leaveWithPickedProducts(user, 2);
  const prompt = await screen.findByRole('dialog', { name: 'Discard 2 food logs?' });

  await user.click(within(prompt).getByRole('button', { name: 'Discard' }));

  await waitFor(() => expect(prompt).not.toBeInTheDocument());

  expect(onDiscard).toHaveBeenCalledOnce();
  expect(onCancel).not.toHaveBeenCalled();
});

test('the discard prompt names a single picked product in the singular', async () => {
  const user = userEvent.setup();
  await leaveWithPickedProducts(user, 1);

  expect(await screen.findByRole('dialog', { name: 'Discard 1 food log?' })).toBeVisible();
});
