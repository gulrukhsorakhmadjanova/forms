import React from "react";
import PropTypes from "prop-types";

export default function Toast({ message, onClose, type = "success" }) {
  return (
    <div className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
         role="alert" aria-live="polite">
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white font-bold" aria-label="Close notification">×</button>
    </div>
  );
}

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  type: PropTypes.string,
};