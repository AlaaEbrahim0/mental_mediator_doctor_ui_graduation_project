import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useUserProfile } from "../context/profileContext";
import { ProfileView } from "../components/profile/ProfileView";
import { CertificateModal } from "../components/profile/CertificateModal";
import { QualificationModal } from "../components/profile/QualificationModal";
import {
    deleteCertificate,
    deleteQualification,
    addCertificate,
    addQualification,
    updateCertificate,
    updateQualification,
} from "../api/profile.api";
import { getApiErrorMessage } from "../api/client";
import {
    Button,
    ConfirmDialog,
    ErrorState,
    Skeleton,
} from "../components/ui/primitives";

const ProfileSkeleton = () => (
    <div className="space-y-6" aria-label="Loading profile">
        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-base-100">
            <Skeleton className="h-44 w-full rounded-none sm:h-56" />
            <div className="px-4 pb-6 sm:px-6 lg:px-8">
                <Skeleton className="-mt-14 h-28 w-28 rounded-full border-4 border-white sm:-mt-16 sm:h-36 sm:w-36" />
                <Skeleton className="mt-4 h-8 w-64" />
                <Skeleton className="mt-3 h-4 w-full max-w-xl" />
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-neutral-200 pt-5 sm:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div key={item}>
                            <Skeleton className="h-7 w-12" />
                            <Skeleton className="mt-2 h-3 w-24" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-6">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-72 w-full rounded-2xl" />
                <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
        </div>
    </div>
);

export function Profile() {
    const navigate = useNavigate();
    const { userProfileData, isLoading, error, refreshProfile } =
        useUserProfile();
    const [certificateModal, setCertificateModal] = useState({
        isOpen: false,
        certificate: null,
    });
    const [qualificationModal, setQualificationModal] = useState({
        isOpen: false,
        qualification: null,
    });
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const closeCertificateModal = () =>
        setCertificateModal({ isOpen: false, certificate: null });

    const closeQualificationModal = () =>
        setQualificationModal({ isOpen: false, qualification: null });

    const saveCertificate = async (values) => {
        if (certificateModal.certificate) {
            await updateCertificate(certificateModal.certificate.id, values);
            toast.success("Certificate updated");
        } else {
            await addCertificate(values);
            toast.success("Certificate added");
        }
        await refreshProfile();
    };

    const saveQualification = async (values) => {
        if (qualificationModal.qualification) {
            await updateQualification(
                qualificationModal.qualification.id,
                values
            );
            toast.success("Qualification updated");
        } else {
            await addQualification(values);
            toast.success("Qualification added");
        }
        await refreshProfile();
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        setIsDeleting(true);
        try {
            if (deleteTarget.type === "certificate") {
                await deleteCertificate(deleteTarget.item.id);
                toast.success("Certificate deleted");
            } else {
                await deleteQualification(deleteTarget.item.id);
                toast.success("Qualification deleted");
            }
            await refreshProfile();
            setDeleteTarget(null);
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading && !userProfileData) return <ProfileSkeleton />;

    if (error && !userProfileData) {
        return (
            <ErrorState
                title="We couldn't load your profile"
                message={getApiErrorMessage(
                    error,
                    "Check your connection and try again."
                )}
                onRetry={refreshProfile}
            />
        );
    }

    if (!userProfileData) {
        return (
            <ErrorState
                title="Profile unavailable"
                message="Your profile could not be found. Try signing in again."
            />
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ProfileView
                profile={userProfileData}
                isOwner
                onEdit={() => navigate("/profile/edit")}
                onAddCertificate={() =>
                    setCertificateModal({ isOpen: true, certificate: null })
                }
                onEditCertificate={(certificate) =>
                    setCertificateModal({ isOpen: true, certificate })
                }
                onDeleteCertificate={(certificate) =>
                    setDeleteTarget({
                        type: "certificate",
                        item: certificate,
                    })
                }
                onAddQualification={() =>
                    setQualificationModal({
                        isOpen: true,
                        qualification: null,
                    })
                }
                onEditQualification={(qualification) =>
                    setQualificationModal({
                        isOpen: true,
                        qualification,
                    })
                }
                onDeleteQualification={(qualification) =>
                    setDeleteTarget({
                        type: "qualification",
                        item: qualification,
                    })
                }
            />

            <CertificateModal
                isOpen={certificateModal.isOpen}
                certificate={certificateModal.certificate}
                onClose={closeCertificateModal}
                onSubmit={saveCertificate}
            />

            <QualificationModal
                isOpen={qualificationModal.isOpen}
                qualification={qualificationModal.qualification}
                onClose={closeQualificationModal}
                onSubmit={saveQualification}
            />

            <ConfirmDialog
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                onError={(requestError) =>
                    toast.error(
                        getApiErrorMessage(
                            requestError,
                            "The item could not be deleted."
                        )
                    )
                }
                title={
                    deleteTarget?.type === "certificate"
                        ? "Delete certificate?"
                        : "Delete qualification?"
                }
                message={
                    deleteTarget?.type === "certificate"
                        ? `“${deleteTarget?.item?.title}” will be removed from your public profile.`
                        : `“${deleteTarget?.item?.degree}” will be removed from your public profile.`
                }
                confirmLabel="Delete"
                loading={isDeleting}
            />

            <div className="mt-6 flex justify-center">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                    Back to top
                </Button>
            </div>
        </motion.div>
    );
}
