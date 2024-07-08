import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { BiImageAdd } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import { motion } from "framer-motion";
export const UpdatePostModal = ({
    isVisible,
    onClose,
    onUpdate,
    loading,
    initialData,
}) => {
    const [title, setTitle] = useState(initialData ? initialData.title : "");
    const [content, setContent] = useState(
        initialData ? initialData.content : ""
    );
    const [postPhoto, setPostPhoto] = useState(
        initialData ? initialData.postPhoto : null
    );
    const [previewUrl, setPreviewUrl] = useState(
        initialData ? initialData.postPhoto : null
    );

    const handleTitleChange = (e) => setTitle(e.target.value);
    const handleContentChange = (e) => setContent(e.target.value);
    const handlePostPhotoChange = (e) => {
        const file = e.target.files[0];
        setPostPhoto(file);
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        try {
            await onUpdate(initialData.id, title, content, postPhoto);
        } catch (error) {
            console.log(error);
        }
    };

    if (!isVisible) return null;

    const modalContent = (
        <div className="fixed inset-0 flex items-center justify-center bg-secondary bg-opacity-20 overflow-auto z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-base-100  p-6 rounded-lg w-full shadow-lg z-50 max-w-2xl mx-4 relative"
            >
                <h2 className="text-2xl font-bold mb-4">Update Post</h2>
                <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Title"
                    disabled={loading}
                    className="input input-bordered bg-base-200 w-full mb-4 font-medium text-lg"
                />
                <textarea
                    disabled={loading}
                    value={content}
                    onChange={handleContentChange}
                    placeholder="Content"
                    className="textarea textarea-bordered bg-base-200 w-full mb-4 text-lg"
                    rows={6}
                />

                <div className="flex justify-end">
                    <button
                        className="btn btn-secondary mr-2"
                        disabled={loading}
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary btn-outline hover:text-white"
                        onClick={handleSubmit}
                        disabled={loading || !title || !content}
                    >
                        {loading && (
                            <span className="loading loading-spinner"></span>
                        )}
                        Update
                    </button>
                </div>
            </motion.div>
        </div>
    );

    return createPortal(modalContent, document.getElementById("modal-root"));
};

export default UpdatePostModal;
