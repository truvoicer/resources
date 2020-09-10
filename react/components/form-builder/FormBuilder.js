import React, {Component, useState} from 'react';
import {Field, Formik, isObject} from "formik";
import {isSet} from "../../../library/utils";
import Select from "react-select";
import DatePicker from "react-datepicker";
import FormList from "./form-components/FormList";

const FormBuilder = (props) => {

    // Returns initial form state
    // Iterates fields data and returns an object
    // with the field name and initial value pairs.
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

    // Returns initial value for form field
    // depending on the field type
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

    const [initialValues, setInitialValues] = useState(getInitialDataObject())
    const [selected, setSelected] = useState(getSelectDefaults())
    const [dates, setDates] = useState(getDatesDefaults())


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
    const getIgnoredFields = (values) => {
        let ignoredFields = [];
        Object.keys(values).map((key) => {
            const field = getFieldByName(key);
            field.subFields?.map((subField) => {
                if ((field.fieldType === "checkbox" && !values[field.name]) ||
                    (field.fieldType === "checkbox" && values[field.name] === "")) {
                    ignoredFields.push(subField.name);
                }
            })
        });
        return ignoredFields;
    }
    const validateForm = (values) => {
        const errors = {};
        const ignoredFields = getIgnoredFields(values);
        Object.keys(values).map((key) => {
            const field = getFieldByName(key);
            if (!ignoredFields.includes(field.name)) {
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
            }
        })
        return errors;
    };

    const formSubmitHandler = (values) => {
        const ignoredFields = getIgnoredFields(values);
        Object.keys(values).map((key) => {
            const field = getFieldByName(key);
            if (field.fieldType === "checkbox" && values[field.name] === "") {
                values[field.name] = false;
            }
            if (ignoredFields.includes(key)) {
                values[key] = "";
            }
        });
        props.submitCallback(values);
    }

    const dateChangeHandler = (values, key, date, e) => {
        setDates({
            [key]: date
        })
        values[key] = date;
    }

    const selectChangeHandler = (name, values, e) => {
        setSelected({
            [name]: e
        })
        values[name] = e? e : [];
        validateForm(values)
    }

    const listFieldCallback = (values, name, data) => {
        values[name] = data;
    }

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
