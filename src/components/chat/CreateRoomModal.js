import { useEffect, useRef, useState } from "react";
import { FiHash } from "react-icons/fi";
import { Button, Input, Modal, Textarea } from "../ui";
import { getChatErrorMessage, useCreateChatRoom } from "../../api/chat.api";

const NAME_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 500;

/**
 * Create a chat room.
 *
 * The doctor UI is doctor-only and ProtectedRoute already requires the Doctor
 * role, so the create action is always available here. The server re-checks
 * the Doctor/Admin role and applies a 5-per-hour rate limit.
 */
export const CreateRoomModal = ({ isOpen, onClose, onCreated }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [formError, setFormError] = useState(null);
    const nameRef = useRef(null);

    const { isLoading, execute } = useCreateChatRoom();

    // Reset the form every time the dialog opens so a previous failed attempt
    // does not linger.
    useEffect(() => {
        if (isOpen) {
            setName("");
            setDescription("");
            setFormError(null);
        }
    }, [isOpen]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const trimmedName = name.trim();
        if (!trimmedName) {
            setFormError("Give the room a name.");
            return;
        }

        setFormError(null);

        try {
            const room = await execute({
                name: trimmedName,
                description: description.trim(),
            });

            onCreated?.(room);
            onClose?.();
        } catch (error) {
            setFormError(getChatErrorMessage(error, "The room could not be created."));
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={isLoading ? undefined : onClose}
            title="Create a chat room"
            description="Rooms are public, but the conversation is visible only to members."
            size="md"
            initialFocusRef={nameRef}
            footer={(
                <>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} loading={isLoading} loadingText="Creating…">
                        Create room
                    </Button>
                </>
            )}
        >
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Input and Textarea render their own Field wrapper, so the
                    label, error and hint are passed to them directly. */}
                <Input
                    id="chat-room-name"
                    ref={nameRef}
                    label="Room name"
                    required
                    error={formError && !name.trim() ? formError : null}
                    hint={`${name.length}/${NAME_MAX_LENGTH} characters`}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={NAME_MAX_LENGTH}
                    placeholder="Anxiety support"
                    disabled={isLoading}
                    autoComplete="off"
                />

                <Textarea
                    id="chat-room-description"
                    label="Description"
                    hint={`${description.length}/${DESCRIPTION_MAX_LENGTH} characters`}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    maxLength={DESCRIPTION_MAX_LENGTH}
                    rows={3}
                    placeholder="What is this room for?"
                    disabled={isLoading}
                />

                {formError && name.trim() && (
                    <p role="alert" className="text-sm font-medium text-error">
                        {formError}
                    </p>
                )}

                <p className="flex items-start gap-2 rounded-xl bg-neutral-50 p-3 text-xs leading-5 text-neutral-600">
                    <FiHash aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                    <span>
                        You become the room owner. Owners moderate reports, assign
                        moderator roles, and archive the room when it is done.
                    </span>
                </p>

                <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
            </form>
        </Modal>
    );
};
