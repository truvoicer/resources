import React, {Component, useState} from 'react';
import {Field, Formik, isObject} from "formik";
import Select from "react-select";
import DatePicker from "react-datepicker";
import FormList from "./form-components/FormList";

export const isSet = (item) => {
    if (typeof item === "undefined") {
        return false
    }
    return true;
}

export const isObject = (object) => {
    return typeof object === "object";
}

const FormBuilder = (props) => {

    /**
     * Returns initial form state
     * Iterates fields data and returns an object
     * with the field name and initial value pairs.
     * @returns {{}}
     */
    const getInitialDataObject = () => {
        let initialValues = {};
        props.data.fields.map((item) => {
            const value = getInitialValue(item);    //Get initial field
            if (value !== null) {
                initialValues[item.name] = value;   //Set field name -> initial value pair in object
            }
            if (isSet(item.subFields)) {            // Check field has subfields
                item.subFields.map((subItem) => {
                    const subValue = getInitialValue(subItem);  // Get initial value for sub field
                    if (subValue !== null) {
                        initialValues[subItem.name] = subValue; //Set field name -> initial value pair in object
                    }
                })
            }
        })
        return initialValues;   // Return initial form field values object
    }

    /**
     * Returns initial value for form field
     * depending on the field type
     * @param item
     * @returns {*}
     */
    const getInitialValue = (item) => {
        let value;
        if (item.fieldType === "text") {
            value = isSet(item.value) ? item.value : "";    // Sets value
        } else if (item.fieldType === "select") {
            value = isSet(props.selectData[item.name]) ? props.selectData[item.name] : [];
        } else if (item.fieldType === "checkbox") {
            value = !!(isSet(item.checked) && item.checked);
        } else if (item.fieldType === "date") {
            value = isSet(item.value) ? item.value : "";
        } else if (item.fieldType === "list") {
            value = isSet(props.listData[item.name]) ? props.listData[item.name] : [];
        }
        return value;
    }

    /**
     * Returns an object of default form values for any select field
     * @returns {{}}
     */
    const getSelectDefaults = () => {
        let selectDefaults = {};
        props.data.fields.map((item) => {
            if (item.fieldType === "select") {
                const value = getInitialValue(item);
                if (value !== null) {
                    selectDefaults[item.name] = value;
                }
            }
            if (isSet(item.subFields)) {
                item.subFields.map((subItem) => {
                    const subValue = getInitialValue(subItem);
                    if (subValue !== null) {
                        selectDefaults[subItem.name] = subValue;
                    }
                })
            }
        });
        return selectDefaults;
    }

    /**
     * Returns an object of default form values for any date fields
     * @returns {{}}
     */
    const getDatesDefaults = () => {
        let datesDefaults = {};
        props.data.fields.map((item) => {
            const value = getInitialValue(item);
            if (value !== null) {
                datesDefaults[item.name] = value;
            }
        });
        return datesDefaults;
    }

    // Set default form input field and  values state
    const [initialValues, setInitialValues] = useState(getInitialDataObject())
    // set default form select field and values state
    const [selected, setSelected] = useState(getSelectDefaults())
    // Set default form date field and values state
    const [dates, setDates] = useState(getDatesDefaults())

    /**
     * Validation function
     * Returns error message or true if validation is successful
     * @param rule
     * @param values
     * @param key
     * @returns {string|boolean|*}
     */
    const validationRules = (rule, values, key) => {
        switch (rule.type) {
            case "required":
                const field = getFieldByName(key);
                if (!values[key]) {
                    return 'Required';
                }
                break;
            case "email":
                if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values[key])) {
                    return 'Invalid email address';
                }
                break;
            case "alphanumeric":
                if (!/^[\w_ ]+$/.test(values[key])) {
                    return 'Can only contain letters and numbers';
                }
                break;
            case "length":
                if (values[key].length < parseInt(rule.min)) {
                    return sprintf('Must be more than %d characters', rule.min);
                } else if (values[key].length > parseInt(rule.max)) {
                    return sprintf('Must be less than %d characters', rule.max)
                }
                break;
            case "password":
                let conditions = "";
                rule.allowedChars?.map((char) => {
                    if (char === "alphanumeric") {
                        conditions += "[A-Z0-9.-]";
                    }
                    if (char === "symbols") {
                        conditions += "[*.! @#$%^&(){}[]:;<>,.?/~_+-=|\\]";
                    }
                })
                const regEx = new RegExp(sprintf("!/^%s$/i", conditions));
                if (regEx.test(values[key])) {
                    return sprintf("Can only contain (%s)", rule.allowedChars.join(", "));
                }
                break;
            case "match":
                if (values[key] !== values[rule.matchField]) {
                    return sprintf('Does not match with %s', getFieldByName(rule.matchField).label);
                }
                break;
        }
        return true;
    }

    /**
     * Returns a field object from the form data by the name of the field
     * @param name
     * @returns {{}}
     */
    const getFieldByName = (name) => {
        let fieldObject = {};
        props.data.fields.map(field => {
            if (isSet(field.subFields)) {
                field.subFields.map((subField) => {
                    if (subField.name === name) {
                        fieldObject = subField
                    }
                })
            }
            if (field.name === name) {
                fieldObject = field
            }
        })
        return fieldObject
    }

    /**
     * Iterates through form field values and validates them
     * Returns error message object for form fields
     * @param values
     * @returns {{}}
     */
    const validateForm = (values) => {
        const errors = {};
        Object.keys(values).map((key) => {
            const field = getFieldByName(key);
            const isAllowEmpty = field.validation?.rules?.filter(rule => rule.type === "allow_empty");
            if (!isSet(isAllowEmpty) ||
                (Array.isArray(isAllowEmpty) && isAllowEmpty.length > 0 && values[field.name] !== "") ||
                (Array.isArray(isAllowEmpty) && isAllowEmpty.length === 0)
            ) {
                field.validation?.rules?.map((rule) => {
                    const validate = validationRules(rule, values, key);
                    if (validate !== true) {
                        errors[key] = validate
                    }
                })
            }

        })
        return errors;
    };

    /**
     * Handler for when form is submitted and has passed validation
     * Passes form field values to the callback function set in props
     * @param values
     */
    const formSubmitHandler = (values) => {
        Object.keys(values).map((key) => {
            const field = getFieldByName(key);
            if (field.fieldType === "checkbox" && values[field.name] === "") {
                values[field.name] = false;
            }
        });
        props.submitCallback(values);
    }

    /**
     * Date field change handler
     * Sets the value in the date fields state
     * Sets the value to the form values state
     * @param values
     * @param key
     * @param date
     * @param e
     */
    const dateChangeHandler = (values, key, date, e) => {
        setDates({
            [key]: date
        })
        values[key] = date;
    }

    /**
     * Select field change handler
     * Sets the value in the select fields state
     * Sets the value to the form values state
     * @param name
     * @param values
     * @param e
     */
    const selectChangeHandler = (name, values, e) => {
        setSelected({
            [name]: e
        })
        values[name] = e? e : [];
        validateForm(values)
    }

    /**
     * List field callback when change event is fired on a list row
     * Sets the form fields values state with list array
     * @param values
     * @param name
     * @param data
     */
    const listFieldCallback = (values, name, data) => {
        values[name] = data;
    }

    /**
     * Checks a form field for a "depends_on" object
     * Returns true if "dependsOn" object is set and
     * the parent field is equal to the value of the field name
     * Returns false otherwise
     * @param field
     * @param values
     * @returns {boolean}
     */
    const dependsOnCheck = (field, values) => {
        let show = false;
        if (isSet(field.dependsOn)) {
            if (isObject(values[field.dependsOn.field]) && field.dependsOn.value === values[field.dependsOn.field].value) {
                show = true;
            } else if (field.dependsOn.value === values[field.dependsOn.field]) {
                show = true;
            }
        } else if (!isSet(field.dependsOn)) {
            show = true;
        }
        return show;
    }

    /**
     * Gets field row for display
     * @param field
     * @param errors
     * @param touched
     * @param handleBlur
     * @param handleChange
     * @param values
     * @returns {JSX.Element}
     */
    const getFieldRow = (field, errors, touched, handleBlur, handleChange, values) => {
        return (
            <>
                {field.fieldType === "text" &&
                getInputRow(field, errors, touched, handleBlur, handleChange, values)
                }
                {field.fieldType === "select" &&
                getSelectRow(field, errors, touched, handleBlur, handleChange, values)
                }
                {field.fieldType === "date" &&
                getDateRow(field, errors, touched, handleBlur, handleChange, values)
                }
                {field.fieldType === "checkbox" &&
                getCheckboxRow(field, errors, touched, handleBlur, handleChange, values)
                }
                {field.fieldType === "list" &&
                getListRow(field, errors, touched, handleBlur, handleChange, values)
                }
            </>
        )
    }

    /**
     * Gets date field for display
     * @param field
     * @param errors
     * @param touched
     * @param handleBlur
     * @param handleChange
     * @param values
     * @returns {JSX.Element}
     */
    const getDateRow = (field, errors, touched, handleBlur, handleChange, values) => {
        return (
            <>
                {dependsOnCheck(field, values) &&
                <div className="row form-group form-group-text">
                    <div className="col-md-12">
                        {field.label &&
                        <>
                            {field.label}
                            <label className="text-black" htmlFor={field.name}>
                        <span className={"site-form--error--field"}>
                            {errors[field.name]}
                        </span>
                            </label>
                        </>
                        }
                        <div className={"row"}>
                            <div className={"col-12"}>
                                <DatePicker
                                    id={field.name}
                                    name={field.name}
                                    dateFormat={field.format}
                                    className={"filter-datepicker"}
                                    selected={dates[field.name]}
                                    showTimeInput
                                    onChange={dateChangeHandler.bind(this, values, field.name)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                }
            </>
        )
    }

    /**
     * Gets list form field component for display
     * @param field
     * @param errors
     * @param touched
     * @param handleBlur
     * @param handleChange
     * @param values
     * @returns {JSX.Element}
     */
    const getListRow = (field, errors, touched, handleBlur, handleChange, values) => {
        return (
            <>
                {dependsOnCheck(field, values) &&
                <div className="row form-group form-group-text">
                    <div className="col-md-12">
                        {field.label &&
                        <>
                            {field.label}
                            <label className="text-black" htmlFor={field.name}>
                        <span className={"site-form--error--field"}>
                            {errors[field.name] && touched[field.name] && errors[field.name]}
                        </span>
                            </label>
                        </>
                        }
                        <FormList callback={listFieldCallback.bind(this, values, field.name)}
                                  listItemKeyLabel={"Key"}
                                  listItemValueLabel={"Value"}
                                  addRowLabel={"Add Parameter"}
                                  data={values[field.name]}
                          />
                    </div>
                </div>
                }
            </>
        )
    }

    /**
     * Gets checkbox form field for display
     * @param field
     * @param errors
     * @param touched
     * @param handleBlur
     * @param handleChange
     * @param values
     * @returns {JSX.Element}
     */
    const getCheckboxRow = (field, errors, touched, handleBlur, handleChange, values) => {
        return (
            <>
                {dependsOnCheck(field, values) &&
                <div className={"form-check-group"}>
                    <div className="form-check">
                        <label>
                            <Field
                                className="form-check-input"
                                type="checkbox"
                                name={field.name}
                                // value={field.value}
                            />
                            {field.label}
                        </label>
                    </div>
                    {field.subFields && values[field.name] &&
                    <div className={"form-subfields"}>
                        {field.subFields.map((subField, subFieldIndex) => (
                            <React.Fragment key={subFieldIndex}>
                                {getFieldRow(subField, errors, touched, handleBlur, handleChange, values)}
                            </React.Fragment>
                        ))}
                    </div>
                    }
                </div>
                }
            </>
        )
    }

    /**
     * Gets select form field for display
     * @param field
     * @param errors
     * @param touched
     * @param handleBlur
     * @param handleChange
     * @param values
     * @returns {JSX.Element}
     */
    const getSelectRow = (field, errors, touched, handleBlur, handleChange, values) => {
        let selectOptions;
        if (!isSet(props.selectOptions[field.name])) {
            return <p>Select error...</p>
        }
        selectOptions = props.selectOptions[field.name];
        return (
            <>
                {dependsOnCheck(field, values) &&
                <div className={"select-wrapper"}>
                    <div className="row form-group form-group-text">
                        <div className="col-md-12">
                            {field.label &&
                            <>
                                {field.label}
                                <label className="text-black" htmlFor={field.name}>
                        <span className={"site-form--error--field"}>
                            {errors[field.name]}
                        </span>
                                </label>
                            </>
                            }
                            <Select
                                isMulti={field.multi && field.multi}
                                options={selectOptions}
                                value={selected[field.name]}
                                onChange={selectChangeHandler.bind(this, field.name, values)}
                            />
                        </div>
                    </div>
                    {field.subFields && values[field.name] &&
                    <div className={"form-subfields"}>
                        {field.subFields.map((subField, subFieldIndex) => (
                            <React.Fragment key={subFieldIndex}>
                                {getFieldRow(subField, errors, touched, handleBlur, handleChange, values)}
                            </React.Fragment>
                        ))}
                    </div>
                    }
                </div>
                }
            </>
        )
    }

    /**
     * Gets input form field for display
     * @param field
     * @param errors
     * @param touched
     * @param handleBlur
     * @param handleChange
     * @param values
     * @returns {JSX.Element}
     */
    const getInputRow = (field, errors, touched, handleBlur, handleChange, values) => {
        return (
            <>
                {dependsOnCheck(field, values) &&
                <div className="row form-group form-group-text">
                    <div className="col-md-12">
                        {field.label &&
                        <>
                            {field.label}
                            <label className="text-black" htmlFor={field.name}>
                        <span className={"site-form--error--field"}>
                            {errors[field.name] && touched[field.name] && errors[field.name]}
                        </span>
                            </label>
                        </>
                        }
                        <input
                            id={field.name}
                            type={field.type}
                            name={field.name}
                            className="form-control text-input"
                            placeholder={field.placeHolder}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values[field.name]}
                        />
                    </div>
                </div>
                }
            </>
        )
    }

    /**
     * Formik component with form data
     */
    return (
        <Formik
            initialValues={initialValues}
            validate={values => validateForm(values)}
            onSubmit={values => formSubmitHandler(values)}
        >
            {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
              }) => (
                <>
                    <form className="site-form"
                          onSubmit={handleSubmit}>
                        {props.data.fields.map((field, index) => (
                            <React.Fragment key={index}>
                                {getFieldRow(field, errors, touched, handleBlur, handleChange, values)}
                            </React.Fragment>
                        ))}

                        <div className="row form-group">
                            <div className="col-md-12">
                                <input type="submit"
                                       value={props.submitButtonText}
                                       className="btn btn-primary py-2 px-4 text-white"/>
                            </div>
                        </div>

                        {props.children}

                    </form>
                </>
            )}
        </Formik>
    );
}
export default FormBuilder;
