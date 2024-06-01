export const CustomDeletionModal = ({ id, handleConfirm }) => {
    return (
        <dialog id={id} className="modal">
            <div className="modal-box bg-white rounded-lg shadow-lg p-6 w-80">
                <h3 className="font-bold text-xl mb-2">Confirm Deletion</h3>
                <p className="py-2">Are you sure you want to delete?</p>
                <div className="modal-action mt-4 flex justify-around">
                    <button
                        className="btn btn-sm btn-secondary mr-2"
                        onClick={() => document.getElementById(id).close()}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-sm btn-error"
                        onClick={handleConfirm}
                    >
                        Confirm Delete
                    </button>
                </div>
            </div>
        </dialog>
    );
};
