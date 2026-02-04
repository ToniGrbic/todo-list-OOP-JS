const fieldValidators = {
  text: {
    validate: (val) => typeof val === "string",
    error: "todo text must be a string",
    transform: (val) => val.trim(),
  },
  completed: {
    validate: (val) => typeof val === "boolean",
    error: "todo completed must be a boolean",
  },
};

const validateAndBuildUpdates = (fields) => {
  const updates = [];
  const values = [];

  for (const [field, value] of Object.entries(fields)) {
    if (value === undefined) continue;

    const validator = fieldValidators[field];
    if (!validator.validate(value)) {
      return { error: validator.error };
    }

    updates.push(`${field} = $${updates.length + 1}`);
    values.push(validator.transform ? validator.transform(value) : value);
  }

  return { updates, values };
};

// module.exports = { validateAndBuildUpdates, fieldValidators };
export { fieldValidators, validateAndBuildUpdates };
