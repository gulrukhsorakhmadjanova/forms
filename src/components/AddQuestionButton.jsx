import React from "react";
import PropTypes from "prop-types";

export default function AddQuestionButton({ onClick, t }) {
  return (
    <button type="button" onClick={onClick} className="mb-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors">{t('addQuestion')}</button>
  );
}

AddQuestionButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
}; 