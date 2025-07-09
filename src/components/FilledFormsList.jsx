import React from "react";
import PropTypes from "prop-types";
import FilledFormCard from "./FilledFormCard";

export default function FilledFormsList({ forms, templatesMap, questionsMap, parseAnswers, isDark, t }) {
  return (
    <>
      {forms.map((form) => (
        <FilledFormCard
          key={form.$id}
          form={form}
          template={templatesMap[form.templateId]}
          questions={questionsMap[form.templateId] || []}
          parsedAnswers={parseAnswers(form.answers)}
          isDark={isDark}
          t={t}
        />
      ))}
    </>
  );
}

FilledFormsList.propTypes = {
  forms: PropTypes.array.isRequired,
  templatesMap: PropTypes.object.isRequired,
  questionsMap: PropTypes.object.isRequired,
  parseAnswers: PropTypes.func.isRequired,
  isDark: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
}; 