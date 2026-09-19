import { useEffect, useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { Modal } from '../ui/Modal';

export const DialogSystem = () => {
  const { events, dialog } = usePlatform();
  const [dialogs, setDialogs] = useState<any[]>([]);

  useEffect(() => {
    const handleOpen = (payload: any) => {
      setDialogs((prev) => [...prev, payload]);
    };

    const handleClose = (payload: any) => {
      setDialogs((prev) => prev.filter((d) => d.dialogId !== payload.dialogId));
    };

    const unsubOpen = events.subscribe('DialogOpened', handleOpen);
    const unsubClose = events.subscribe('DialogClosed', handleClose);

    return () => {
      unsubOpen();
      unsubClose();
    };
  }, [events]);

  if (dialogs.length === 0) return null;

  return (
    <>
      {dialogs.map((d) => (
        <Modal
          key={d.dialogId}
          isOpen={true}
          onClose={() => dialog.close(d.dialogId)}
          title={d.props?.title}
          description={d.props?.description}
          footer={d.props?.footer}
          className={d.props?.className}
        >
          {d.component}
        </Modal>
      ))}
    </>
  );
};
