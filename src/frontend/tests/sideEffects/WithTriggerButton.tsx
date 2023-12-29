import { type ReactElement, type FC, useState } from 'react';

interface TriggerArgs {
  active: boolean;
  onTriggerClick: () => void;
}

interface WithTriggerButtonProps {
  label: string;
  children: (args: TriggerArgs) => ReactElement;
}

export const WithTriggerButton: FC<WithTriggerButtonProps> = ({ label, children }) => {
  const [active, setActive] = useState(false);

  const onTriggerClick = (): void => {
    setActive(state => !state);
  };

  return (
    <>
      <button type="button" onClick={onTriggerClick}>
        {label}
      </button>
      {children({
        active,
        onTriggerClick,
      })}
    </>
  );
};
