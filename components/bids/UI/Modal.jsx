import {useRef, useEffect} from 'react';

function Modal({open, children, onClose, classesModal= "  w-full  max-w-md max-h-full rounded-lg"}) {
    const dialog = useRef();

    useEffect(() => {
        if (open) {
            dialog.current.showModal();
        } else {
            dialog.current.close();
        }
    }, [open]);

    return (
        <dialog className={classesModal} ref={dialog} onClose={onClose}>
            {open ? children : null}
        </dialog>
    );
}

export default Modal;
