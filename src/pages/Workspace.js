import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    FiActivity,
    FiCalendar,
    FiClipboard,
    FiFileText,
    FiPlus,
    FiRefreshCw,
    FiShare2,
} from "react-icons/fi";
import toast from "react-hot-toast";
import {
    createFollowUp,
    createPatientNote,
    getFollowUps,
    getPatientNotes,
    updateFollowUp,
    updatePatientNote,
    useDoctorActivity,
    useDoctorDashboard,
} from "../api/workspace.api";
import { getDoctorAppointments } from "../api/appointments.api";
import { getApiErrorMessage } from "../api/client";
import { MetricCards } from "../components/dashboard/MetricCards";
import { ActivityFeed } from "../components/dashboard/ActivityFeed";
import {
    Alert,
    Button,
    EmptyState,
    Input,
    Modal,
    Select,
    Skeleton,
    Textarea,
} from "../components/ui";

const toIso = (localValue) => {
    if (!localValue) return null;
    const date = new Date(localValue);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
};


const formatDate = (value) => {
    if (!value) return "Not dated";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "Not dated"
        : date.toLocaleString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
          });
};

const NoteEditor = ({ note, patients, appointments, loading, onClose, onSave }) => {
    const isEdit = Boolean(note?.id);
    const [patientId, setPatientId] = useState(note?.patientId || patients[0]?.id || "");
    const [appointmentId, setAppointmentId] = useState(note?.appointmentId ? String(note.appointmentId) : "");
    const [title, setTitle] = useState(note?.title || "");
    const [body, setBody] = useState(note?.body || "");
    const [isPatientVisible, setPatientVisible] = useState(Boolean(note?.isPatientVisible));
    const [error, setError] = useState("");

    const patientAppointments = appointments.filter(
        (appointment) => appointment.userId === patientId
    );

    const submit = async (event) => {
        event.preventDefault();
        if (!patientId) {
            setError("Choose a patient.");
            return;
        }
        if (!title.trim()) {
            setError("Give the note a title.");
            return;
        }
        if (!body.trim()) {
            setError("Write the note body.");
            return;
        }
        setError("");
        try {
            await onSave(
                {
                    patientId,
                    appointmentId: appointmentId ? Number(appointmentId) : null,
                    title: title.trim(),
                    body: body.trim(),
                    isPatientVisible,
                },
                note?.id
            );
            onClose();
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, "The note could not be saved."));
        }
    };

    return (
        <Modal
            isOpen
            onClose={loading ? undefined : onClose}
            title={isEdit ? "Edit consultation note" : "New consultation note"}
            description="Notes are private unless you explicitly share them with the patient."
            size="2xl"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button type="submit" form="note-editor-form" loading={loading} loadingText="Saving…">
                        {isEdit ? "Save note" : "Create note"}
                    </Button>
                </>
            }
        >
            <form id="note-editor-form" onSubmit={submit} className="space-y-4">
                {error && <Alert variant="error">{error}</Alert>}
                <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-neutral-800">Patient</span>
                    <Select value={patientId} onChange={(event) => { setPatientId(event.target.value); setAppointmentId(""); }} disabled={isEdit || loading}>
                        <option value="">Choose a patient…</option>
                        {patients.map((patient) => (
                            <option key={patient.id} value={patient.id}>{patient.name}</option>
                        ))}
                    </Select>
                </label>
                <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-neutral-800">Related appointment <span className="font-normal text-neutral-500">(optional)</span></span>
                    <Select value={appointmentId} onChange={(event) => setAppointmentId(event.target.value)} disabled={isEdit || loading}>
                        <option value="">No specific appointment</option>
                        {patientAppointments.map((appointment) => (
                            <option key={appointment.id} value={appointment.id}>
                                {formatDate(appointment.startTime)} · {appointment.status}
                            </option>
                        ))}
                    </Select>
                </label>
                <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} disabled={loading} />
                <Textarea label="Note" value={body} onChange={(event) => setBody(event.target.value)} rows={7} maxLength={4000} disabled={loading} hint={`${body.length}/4000`} />
                <label className="flex items-start justify-between gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3.5">
                    <span className="min-w-0">
                        <span className="flex items-center gap-2 text-sm font-semibold text-neutral-900"><FiShare2 aria-hidden="true" /> Share with patient</span>
                        <span className="mt-1 block text-xs leading-5 text-neutral-600">
                            The patient will see this note in their health history. Leave it off for internal notes.
                        </span>
                    </span>
                    <input
                        type="checkbox"
                        checked={isPatientVisible}
                        onChange={(event) => setPatientVisible(event.target.checked)}
                        disabled={loading}
                        className="toggle toggle-primary shrink-0"
                    />
                </label>
            </form>
        </Modal>
    );
};

const FollowUpEditor = ({ patients, appointments, loading, onClose, onSave }) => {
    const [patientId, setPatientId] = useState(patients[0]?.id || "");
    const [appointmentId, setAppointmentId] = useState("");
    const [reason, setReason] = useState("");
    const [dueAt, setDueAt] = useState("");
    const [isPatientVisible, setPatientVisible] = useState(false);
    const [error, setError] = useState("");
    const patientAppointments = appointments.filter((appointment) => appointment.userId === patientId);

    const submit = async (event) => {
        event.preventDefault();
        if (!patientId) {
            setError("Choose a patient.");
            return;
        }
        if (!reason.trim()) {
            setError("Describe the follow-up.");
            return;
        }
        setError("");
        try {
            await onSave({
                patientId,
                appointmentId: appointmentId ? Number(appointmentId) : null,
                reason: reason.trim(),
                dueAtUtc: toIso(dueAt),
                isPatientVisible,
            });
            onClose();
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, "The follow-up could not be created."));
        }
    };

    return (
        <Modal
            isOpen
            onClose={loading ? undefined : onClose}
            title="New follow-up"
            description="Promise a check-in. Shared follow-ups appear in the patient's history."
            size="2xl"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button type="submit" form="follow-up-editor-form" loading={loading} loadingText="Saving…">Create follow-up</Button>
                </>
            }
        >
            <form id="follow-up-editor-form" onSubmit={submit} className="space-y-4">
                {error && <Alert variant="error">{error}</Alert>}
                <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-neutral-800">Patient</span>
                    <Select value={patientId} onChange={(event) => { setPatientId(event.target.value); setAppointmentId(""); }} disabled={loading}>
                        <option value="">Choose a patient…</option>
                        {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}
                    </Select>
                </label>
                <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-neutral-800">Related appointment <span className="font-normal text-neutral-500">(optional)</span></span>
                    <Select value={appointmentId} onChange={(event) => setAppointmentId(event.target.value)} disabled={loading}>
                        <option value="">No specific appointment</option>
                        {patientAppointments.map((appointment) => (
                            <option key={appointment.id} value={appointment.id}>{formatDate(appointment.startTime)} · {appointment.status}</option>
                        ))}
                    </Select>
                </label>
                <Input label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={200} disabled={loading} />
                <Input label="Due date and time" type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} disabled={loading} />
                <label className="flex items-start justify-between gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3.5">
                    <span className="min-w-0">
                        <span className="flex items-center gap-2 text-sm font-semibold text-neutral-900"><FiShare2 aria-hidden="true" /> Share with patient</span>
                        <span className="mt-1 block text-xs leading-5 text-neutral-600">Show the follow-up instructions and due date in the patient's history.</span>
                    </span>
                    <input type="checkbox" checked={isPatientVisible} onChange={(event) => setPatientVisible(event.target.checked)} disabled={loading} className="toggle toggle-primary shrink-0" />
                </label>
            </form>
        </Modal>
    );
};

const NoteCard = ({ note, busy, onEdit, onToggleVisibility }) => (
    <article className="rounded-2xl border border-neutral-200 bg-base-100 p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
                <h3 className="break-words text-sm font-bold text-neutral-900 sm:text-base">{note.title}</h3>
                <p className="mt-1 text-xs text-neutral-600">
                    {note.patientName ? (
                        <Link to={`/profiles/${encodeURIComponent(note.patientId)}`} className="font-semibold text-primary-800 hover:underline">{note.patientName}</Link>
                    ) : "Patient"} · {formatDate(note.updatedAtUtc || note.createdAtUtc)}
                </p>
            </div>
            <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${note.isPatientVisible ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-neutral-200 bg-neutral-50 text-neutral-700"}`}>
                {note.isPatientVisible ? "Shared with patient" : "Private"}
            </span>
        </div>
        <p className="mt-2 line-clamp-4 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-700">{note.body}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                <input type="checkbox" checked={note.isPatientVisible} onChange={(event) => onToggleVisibility(note, event.target.checked)} disabled={busy} className="toggle toggle-sm toggle-primary" />
                Share with patient
            </label>
            <div className="flex items-center gap-2">
                <Link to={`/workspace/patients/${encodeURIComponent(note.patientId)}`} className="btn btn-ghost btn-sm min-h-9 px-2.5 text-xs text-primary-800">History</Link>
                <Button size="sm" variant="outline" onClick={() => onEdit(note)} disabled={busy}>Edit</Button>
            </div>
        </div>
    </article>
);

const FollowUpCard = ({ followUp, busy, onStatusChange, onToggleVisibility }) => (
    <article className="rounded-2xl border border-neutral-200 bg-base-100 p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
                <h3 className="break-words text-sm font-bold text-neutral-900 sm:text-base">{followUp.reason}</h3>
                <p className="mt-1 text-xs text-neutral-600">
                    {followUp.patientName ? (
                        <Link to={`/profiles/${encodeURIComponent(followUp.patientId)}`} className="font-semibold text-primary-800 hover:underline">{followUp.patientName}</Link>
                    ) : "Patient"}
                    {followUp.dueAtUtc ? ` · due ${formatDate(followUp.dueAtUtc)}` : " · no due date"}
                </p>
            </div>
            <Select
                aria-label="Follow-up status"
                value={followUp.status}
                onChange={(event) => onStatusChange(followUp, event.target.value)}
                disabled={busy}
                className="h-9 min-h-9 w-28 text-xs"
            >
                <option value="Open">Open</option>
                <option value="Done">Done</option>
                <option value="Cancelled">Cancelled</option>
            </Select>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                <input type="checkbox" checked={followUp.isPatientVisible} onChange={(event) => onToggleVisibility(followUp, event.target.checked)} disabled={busy} className="toggle toggle-sm toggle-primary" />
                Share with patient
            </label>
            <div className="flex items-center gap-2">
                <Link to={`/workspace/patients/${encodeURIComponent(followUp.patientId)}`} className="btn btn-ghost btn-sm min-h-9 px-2.5 text-xs text-primary-800">History</Link>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${followUp.isPatientVisible ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-neutral-200 bg-neutral-50 text-neutral-700"}`}>
                    {followUp.isPatientVisible ? "Visible to patient" : "Private"}
                </span>
            </div>
        </div>
    </article>
);

export const Workspace = () => {
    const { dashboard, isLoading: dashboardLoading, error: dashboardError, refresh: refreshDashboard } = useDoctorDashboard();
    const { activity, isLoading: activityLoading, error: activityError, refresh: refreshActivity } = useDoctorActivity(30);
    const [tab, setTab] = useState("notes");
    const [notes, setNotes] = useState([]);
    const [followUps, setFollowUps] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [notesLoading, setNotesLoading] = useState(true);
    const [followUpsLoading, setFollowUpsLoading] = useState(true);
    const [listError, setListError] = useState("");
    const [noteEditor, setNoteEditor] = useState(null);
    const [isFollowUpEditorOpen, setFollowUpEditorOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [busyId, setBusyId] = useState(null);

    const loadNotes = useCallback(async () => {
        setNotesLoading(true);
        try {
            const result = await getPatientNotes({ limit: 50 });
            setNotes(Array.isArray(result) ? result : []);
        } catch (requestError) {
            setListError(getApiErrorMessage(requestError, "Notes could not be loaded."));
        } finally {
            setNotesLoading(false);
        }
    }, []);

    const loadFollowUps = useCallback(async () => {
        setFollowUpsLoading(true);
        try {
            const result = await getFollowUps({ limit: 50 });
            setFollowUps(Array.isArray(result) ? result : []);
        } catch (requestError) {
            setListError(getApiErrorMessage(requestError, "Follow-ups could not be loaded."));
        } finally {
            setFollowUpsLoading(false);
        }
    }, []);

    const loadAppointments = useCallback(async () => {
        try {
            const result = await getDoctorAppointments({ pageNumber: 1, pageSize: 100 });
            setAppointments(Array.isArray(result) ? result : []);
        } catch {
            setAppointments([]);
        }
    }, []);

    useEffect(() => {
        loadNotes();
        loadFollowUps();
        loadAppointments();
    }, [loadNotes, loadFollowUps, loadAppointments]);

    const patients = useMemo(() => {
        const map = new Map();
        appointments.forEach((appointment) => {
            if (!appointment.userId || map.has(appointment.userId)) return;
            map.set(appointment.userId, {
                id: appointment.userId,
                name: appointment.clientName || appointment.clientEmail || "Patient",
            });
        });
        notes.forEach((note) => {
            if (note.patientId && !map.has(note.patientId)) {
                map.set(note.patientId, { id: note.patientId, name: note.patientName || "Patient" });
            }
        });
        followUps.forEach((followUp) => {
            if (followUp.patientId && !map.has(followUp.patientId)) {
                map.set(followUp.patientId, { id: followUp.patientId, name: followUp.patientName || "Patient" });
            }
        });
        return [...map.values()].sort((left, right) => left.name.localeCompare(right.name));
    }, [appointments, notes, followUps]);

    const saveNote = async (payload, noteId) => {
        setSaving(true);
        try {
            const saved = noteId
                ? await updatePatientNote(noteId, {
                      title: payload.title,
                      body: payload.body,
                      isPatientVisible: payload.isPatientVisible,
                  })
                : await createPatientNote(payload);
            setNotes((previous) => noteId
                ? previous.map((note) => note.id === noteId ? saved : note)
                : [saved, ...previous]);
            toast.success(noteId ? "Note updated" : "Note created");
            refreshDashboard().catch(() => undefined);
            refreshActivity().catch(() => undefined);
        } finally {
            setSaving(false);
        }
    };

    const saveFollowUp = async (payload) => {
        setSaving(true);
        try {
            const saved = await createFollowUp(payload);
            setFollowUps((previous) => [saved, ...previous]);
            toast.success("Follow-up created");
            refreshDashboard().catch(() => undefined);
            refreshActivity().catch(() => undefined);
        } finally {
            setSaving(false);
        }
    };

    const updateFollowUpField = async (followUp, patch) => {
        setBusyId(followUp.id);
        try {
            const saved = await updateFollowUp(followUp.id, patch);
            setFollowUps((previous) => previous.map((item) => item.id === followUp.id ? saved : item));
            toast.success("Follow-up updated");
            refreshDashboard().catch(() => undefined);
        } catch (requestError) {
            toast.error(getApiErrorMessage(requestError, "The follow-up could not be updated."));
        } finally {
            setBusyId(null);
        }
    };

    const toggleNoteVisibility = async (note, isPatientVisible) => {
        setBusyId(`note-${note.id}`);
        try {
            const saved = await updatePatientNote(note.id, {
                isPatientVisible,
            });
            setNotes((previous) => previous.map((item) => item.id === note.id ? saved : item));
            toast.success(isPatientVisible ? "Note shared with the patient" : "Note is private again");
        } catch (requestError) {
            toast.error(getApiErrorMessage(requestError, "The note could not be updated."));
        } finally {
            setBusyId(null);
        }
    };

    const tabs = [
        { key: "notes", label: "Notes", count: notes.length, icon: FiFileText },
        { key: "follow-ups", label: "Follow-ups", count: followUps.length, icon: FiClipboard },
        { key: "activity", label: "Activity", count: activity?.length || 0, icon: FiActivity },
    ];

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">Patient workspace</h1>
                    <p className="mt-1 text-sm text-neutral-600">
                        Your notes, follow-ups and patient activity in one place.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => { loadNotes(); loadFollowUps(); refreshDashboard(); refreshActivity(); }} loading={notesLoading || followUpsLoading} loadingText="Refreshing…">
                        <FiRefreshCw aria-hidden="true" /> Refresh
                    </Button>
                    <Button size="sm" onClick={() => setTab("notes") || setNoteEditor({ mode: "create" })}>
                        <FiPlus aria-hidden="true" /> New note
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setFollowUpEditorOpen(true)}>
                        <FiPlus aria-hidden="true" /> New follow-up
                    </Button>
                </div>
            </header>

            {dashboardError && <Alert variant="error" title="Dashboard summary unavailable">{getApiErrorMessage(dashboardError, "The summary could not be loaded.")}</Alert>}
            <section aria-label="Workspace summary">
                {dashboardLoading && !dashboard ? <Skeleton className="h-32 w-full" rounded="rounded-2xl" /> : <MetricCards dashboard={dashboard} />}
            </section>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div role="tablist" aria-label="Workspace sections" className="inline-flex flex-wrap gap-1 rounded-xl border border-neutral-200 bg-base-100 p-1">
                    {tabs.map(({ key, label, count, icon: Icon }) => (
                        <button
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={tab === key}
                            onClick={() => setTab(key)}
                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 ${tab === key ? "bg-primary-700 text-white" : "text-neutral-700 hover:bg-neutral-100"}`}
                        >
                            <Icon aria-hidden="true" /> {label} <span className={`rounded-full px-1.5 py-0.5 text-[11px] ${tab === key ? "bg-white/20" : "bg-neutral-100"}`}>{count}</span>
                        </button>
                    ))}
                </div>
                <Link to="/appointments" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-800 hover:underline">
                    <FiCalendar aria-hidden="true" /> Appointment requests
                </Link>
            </div>

            {listError && (
                <Alert variant="error" title="Workspace data could not be loaded" action={<Button size="sm" variant="ghost" onClick={() => { setListError(""); loadNotes(); loadFollowUps(); }}>Retry</Button>}>
                    {listError}
                </Alert>
            )}

            {tab === "notes" && (
                <section className="space-y-3" aria-label="Consultation notes">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-bold text-neutral-900">Consultation notes</h2>
                        <Button size="sm" onClick={() => setNoteEditor({ mode: "create" })} disabled={!patients.length}>
                            <FiPlus aria-hidden="true" /> New note
                        </Button>
                    </div>
                    {!patients.length && <Alert variant="info">A note can be created once you have an appointment or a patient record. Pending appointment requests appear under Appointments.</Alert>}
                    {notesLoading && notes.length === 0 ? (
                        <div className="space-y-3">{[0, 1, 2].map((index) => <Skeleton key={index} className="h-36 w-full" rounded="rounded-2xl" />)}</div>
                    ) : notes.length === 0 ? (
                        <EmptyState icon={<FiFileText aria-hidden="true" />} title="No consultation notes yet" description="Create a note after a session. Notes stay private until you share them." action={<Button size="sm" onClick={() => setNoteEditor({ mode: "create" })} disabled={!patients.length}>New note</Button>} />
                    ) : (
                        <div className="grid gap-3 lg:grid-cols-2">
                            {notes.map((note) => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    busy={busyId === `note-${note.id}`}
                                    onEdit={(item) => setNoteEditor({ mode: "edit", note: item })}
                                    onToggleVisibility={toggleNoteVisibility}
                                />
                            ))}
                        </div>
                    )}
                </section>
            )}

            {tab === "follow-ups" && (
                <section className="space-y-3" aria-label="Follow-ups">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-bold text-neutral-900">Follow-ups</h2>
                        <Button size="sm" onClick={() => setFollowUpEditorOpen(true)} disabled={!patients.length}>
                            <FiPlus aria-hidden="true" /> New follow-up
                        </Button>
                    </div>
                    {followUpsLoading && followUps.length === 0 ? (
                        <div className="space-y-3">{[0, 1, 2].map((index) => <Skeleton key={index} className="h-28 w-full" rounded="rounded-2xl" />)}</div>
                    ) : followUps.length === 0 ? (
                        <EmptyState icon={<FiClipboard aria-hidden="true" />} title="No follow-ups yet" description="Create a check-in to keep track of patients who need a later conversation." />
                    ) : (
                        <div className="grid gap-3 lg:grid-cols-2">
                            {followUps.map((followUp) => (
                                <FollowUpCard
                                    key={followUp.id}
                                    followUp={followUp}
                                    busy={busyId === followUp.id}
                                    onStatusChange={(item, status) => updateFollowUpField(item, { status })}
                                    onToggleVisibility={(item, isPatientVisible) => updateFollowUpField(item, { isPatientVisible })}
                                />
                            ))}
                        </div>
                    )}
                </section>
            )}

            {tab === "activity" && (
                <section aria-label="Patient activity">
                    <ActivityFeed items={activity} isLoading={activityLoading} error={activityError} onRetry={() => refreshActivity()} />
                </section>
            )}

            {noteEditor && (
                <NoteEditor
                    key={noteEditor.note?.id || "new-note"}
                    note={noteEditor.note}
                    patients={patients}
                    appointments={appointments}
                    loading={saving}
                    onClose={() => setNoteEditor(null)}
                    onSave={saveNote}
                />
            )}

            {isFollowUpEditorOpen && (
                <FollowUpEditor
                    patients={patients}
                    appointments={appointments}
                    loading={saving}
                    onClose={() => setFollowUpEditorOpen(false)}
                    onSave={saveFollowUp}
                />
            )}
        </div>
    );
};
